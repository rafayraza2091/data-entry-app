'use client';

import { useState, useEffect } from 'react';

export default function ViewTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline editing state for text inputs only
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tasksRes, subjRes, booksRes, chapRes, topRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/chapters'),
          fetch('/api/topics')
        ]);
        
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (subjRes.ok) setSubjectsList(await subjRes.json());
        if (booksRes.ok) setBooksList(await booksRes.json());
        if (chapRes.ok) setChaptersList(await chapRes.json());
        if (topRes.ok) setTopicsList(await topRes.json());
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return '#3b82f6';
      case 'DONE': return '#22c55e';
      case 'PENDING': return '#eab308';
      case 'OPEN': default: return '#94a3b8';
    }
  };

  const handleEditClick = (task: any, field: string) => {
    setEditingTask(task.id);
    setEditingField(field);
    setEditValue(task[field] || '');
  };

  const handleSaveEdit = async (taskId: number, field: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, fieldName: field, newValue: editValue })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: editValue } : t));
      } else {
        const data = await res.json();
        alert('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    }
    setEditingTask(null);
    setEditingField(null);
  };

  const handleSaveEditDirect = async (taskId: number, field: string, value: string) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, fieldName: field, newValue: value })
      });
      if (!res.ok) {
        const data = await res.json();
        alert('Failed to update: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    }
  };

  const renderEditableCell = (task: any, field: string) => {
    let isSelect = false;
    let options: string[] = [];

    if (field === 'status') {
      isSelect = true;
      options = ['OPEN', 'IN_PROGRESS', 'DONE', 'PENDING'];
    } else if (field === 'taskType') {
      isSelect = true;
      options = ['Home Work', 'Tuition Work', 'Class Work', 'Test', 'Project'];
    } else if (field === 'subject') {
      isSelect = true;
      options = subjectsList.map(s => s.name);
    } else if (field === 'book') {
      isSelect = true;
      options = booksList.filter(b => b.subject === task.subject).map(b => b.title);
    } else if (field === 'chapter') {
      isSelect = true;
      options = chaptersList.filter(c => c.subject === task.subject && c.book === task.book).map(c => c.chapterTitle || c.chapterName);
    } else if (field === 'topic') {
      isSelect = true;
      const availableTopics = topicsList.filter(t => t.subject === task.subject && t.book === task.book && (t.chapterTitle === task.chapter || t.chapterName === task.chapter));
      options = Array.from(new Set(availableTopics.map(t => t.topicName).filter(Boolean)));
    } else if (field === 'exercise') {
      isSelect = true;
      const availableTopics = topicsList.filter(t => t.subject === task.subject && t.book === task.book && (t.chapterTitle === task.chapter || t.chapterName === task.chapter));
      options = Array.from(new Set(availableTopics.map(t => t.exercise).filter(Boolean)));
    }
    
    // For Select Dropdowns, render the native select always, styled nicely!
    if (isSelect) {
      if (field === 'status') {
        return (
          <select 
            value={task[field] || 'OPEN'} 
            onChange={e => handleSaveEditDirect(task.id, field, e.target.value)}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '12px', 
              fontSize: '0.85rem',
              fontWeight: 'bold',
              backgroundColor: getStatusColor(task[field] || 'OPEN'),
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              textAlign: 'center',
              display: 'inline-block'
            }}
          >
            {options.map((o, i) => <option key={i} value={o} style={{color: 'black'}}>{o.replace('_', ' ')}</option>)}
          </select>
        );
      }
      
      // For Subject, Book, Chapter, taskType etc
      return (
        <select 
          value={task[field] || (field === 'taskType' ? 'Home Work' : '')} 
          onChange={e => handleSaveEditDirect(task.id, field, e.target.value)}
          style={{ 
            background: 'transparent', 
            color: 'inherit', 
            border: 'none', 
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            display: 'inline-block',
            width: '100%',
            maxWidth: '150px',
            textOverflow: 'ellipsis'
          }}
        >
          <option value="" disabled>-</option>
          {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
      );
    }

    // For Text Inputs (Description)
    const isEditing = editingTask === task.id && editingField === field;
    if (isEditing) {
      return (
        <input 
          type="text" 
          value={editValue} 
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(task.id, field)}
          onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(task.id, field) }}
          autoFocus
          style={{ padding: '4px', borderRadius: '4px', background: '#1e293b', color: 'white', border: '1px solid #3b82f6', width: '100%', minWidth: '120px' }}
        />
      );
    }

    return (
      <span 
        onClick={() => handleEditClick(task, field)} 
        style={{ cursor: 'pointer', display: 'inline-block', minWidth: '30px', minHeight: '20px' }}
      >
        {task[field] || '-'}
      </span>
    );
  };

  const renderTable = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading tasks...</div>;
    }

    if (tasks.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No tasks found.</div>;
    }

    const headers = [
      'ID', 
      'Assignee',
      'Reporter',
      'Class', 
      'Task Type',
      'Subject', 
      'Book', 
      'Chapter', 
      'Topic', 
      'Exercise', 
      'Description', 
      'Status',
      'Created By',
      'Date Added'
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
              {headers.map(h => <th key={h} className="p-2 md:p-4 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {tasks.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-2 md:p-4 text-sm text-gray-600">{idx + 1}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.assignee}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.reporter}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.className || '-'}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'taskType')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'subject')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'book')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'chapter')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'topic')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'exercise')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600" style={{ maxWidth: '250px', whiteSpace: 'normal', wordWrap: 'break-word' }} title={item.description}>
                  {renderEditableCell(item, 'description')}
                </td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'status')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.createdBy}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-2 md:px-8 py-4 md:py-8" style={{ maxWidth: '100%' }}>

      
      <div className="animate-slide-up w-full">
        {renderTable()}
      </div>
    </main>
  );
}
