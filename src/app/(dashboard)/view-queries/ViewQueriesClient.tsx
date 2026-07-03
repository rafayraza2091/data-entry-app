'use client';

import { useState, useEffect } from 'react';

export default function ViewQueriesClient({ currentUser }: { currentUser: any }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline editing state
  const [editingQuery, setEditingQuery] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    async function fetchQueries() {
      try {
        const response = await fetch('/api/queries');
        if (!response.ok) {
          throw new Error('Failed to fetch queries');
        }
        const data = await response.json();

        // Apply filtering based on role
        if (currentUser.role === 'STUDENT') {
          const studentFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
          const filtered = data.filter((q: any) => q.studentName === studentFullName);
          setQueries(filtered);
        } else {
          // Teachers, Owners, Coordinators, Admins see everything
          setQueries(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchQueries();
    }
  }, [currentUser]);

  const handleEditSubmit = async (queryId: number) => {
    if (!editValue.trim()) {
      setEditingQuery(null);
      return;
    }

    try {
      const response = await fetch(`/api/queries/${queryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queryStatement: editValue }),
      });

      if (response.ok) {
        setQueries(queries.map(q => q.id === queryId ? { ...q, queryStatement: editValue } : q));
      } else {
        console.error('Failed to update query');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditingQuery(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading queries...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="animate-slide-up" style={{ padding: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {currentUser.role === 'STUDENT' ? 'My Queries' : 'All Student Queries'}
      </h1>

      {queries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No queries found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-teal-600 uppercase text-xs tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Class</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Topic / Details</th>
                <th className="p-4 font-semibold">Query Statement</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{q.studentName}</td>
                  <td className="p-4 text-sm text-gray-600">{q.className}</td>
                  <td className="p-4 text-sm text-gray-600">{q.subject}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {q.topic && <div><span className="text-gray-400">Topic:</span> {q.topic}</div>}
                    {q.exercise && <div><span className="text-gray-400">Ex:</span> {q.exercise}</div>}
                    {q.questionNumber && <div><span className="text-gray-400">Q:</span> {q.questionNumber}</div>}
                    {q.pageNumber && <div><span className="text-gray-400">Page:</span> {q.pageNumber}</div>}
                    {!q.topic && !q.exercise && !q.pageNumber && '-'}
                  </td>
                  <td className="p-4 text-sm text-gray-700 max-w-xs truncate" title={q.queryStatement}>
                    {editingQuery === q.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSubmit(q.id);
                            if (e.key === 'Escape') setEditingQuery(null);
                          }}
                          autoFocus
                          onBlur={() => handleEditSubmit(q.id)}
                        />
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors -ml-2 truncate"
                        onClick={() => {
                          setEditingQuery(q.id);
                          setEditValue(q.queryStatement);
                        }}
                      >
                        {q.queryStatement || <span className="text-gray-400 italic">Empty</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
