'use client';

import { useState, useEffect } from 'react';

export default function ViewQueriesClient({ currentUser }: { currentUser: any }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div style={{ padding: '2rem' }}>Loading queries...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="animate-slide-up" style={{ padding: '2rem' }}>
      <h1 className="text-2xl font-bold mb-6 text-white">
        {currentUser.role === 'STUDENT' ? 'My Queries' : 'All Student Queries'}
      </h1>

      {queries.length === 0 ? (
        <div className="glass-panel p-6 text-center text-gray-400">
          No queries found.
        </div>
      ) : (
        <div className="glass-panel overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-primary uppercase text-xs tracking-wider">
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
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-gray-300 whitespace-nowrap">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-white">{q.studentName}</td>
                  <td className="p-4 text-sm text-gray-300">{q.className}</td>
                  <td className="p-4 text-sm text-gray-300">{q.subject}</td>
                  <td className="p-4 text-sm text-gray-400">
                    {q.topic && <div><span className="text-gray-500">Topic:</span> {q.topic}</div>}
                    {q.exercise && <div><span className="text-gray-500">Ex:</span> {q.exercise}</div>}
                    {q.questionNumber && <div><span className="text-gray-500">Q:</span> {q.questionNumber}</div>}
                    {q.pageNumber && <div><span className="text-gray-500">Page:</span> {q.pageNumber}</div>}
                    {!q.topic && !q.exercise && !q.pageNumber && '-'}
                  </td>
                  <td className="p-4 text-sm text-gray-300 max-w-xs truncate" title={q.queryStatement}>
                    {q.queryStatement}
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
