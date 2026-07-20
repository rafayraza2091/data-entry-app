'use client';

import { useState, useEffect } from 'react';
import ImagePreview from '@/components/ImagePreview';
import ImageCropper from '@/components/ImageCropper';
import { compressImage } from '@/lib/compressImage';

const getMarksColor = (obtained: number | null | undefined, total: number | null | undefined = 10) => {
  if (obtained === null || obtained === undefined) return 'inherit';
  const t = total || 10;
  if (t === 0) return 'inherit';
  const pct = (obtained / t) * 100;
  if (pct <= 50) return '#dc2626'; // text-red-600
  if (pct <= 60) return '#ca8a04'; // text-yellow-600
  if (pct <= 70) return '#f97316'; // text-orange-500
  if (pct <= 80) return '#2563eb'; // text-blue-600
  return '#16a34a'; // text-green-600
};

export default function ViewTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Reschedule Modal State
  const [isRescheduleDatePickerOpen, setIsRescheduleDatePickerOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTaskId, setRescheduleTaskId] = useState<number | null>(null);
  const [rescheduleCalendarMonth, setRescheduleCalendarMonth] = useState(new Date());

  // Inline editing state for text inputs only
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Image Upload and Preview State
  const [previewImages, setPreviewImages] = useState<string[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewTask, setPreviewTask] = useState<any | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [targetTaskForCrop, setTargetTaskForCrop] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTaskType, setFilterTaskType] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [subjRes, booksRes, chapRes, topRes, usersRes, classesRes, meRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/chapters'),
          fetch('/api/topics'),
          fetch(`/api/task-users?t=${Date.now()}`),
          fetch('/api/classes'),
          fetch('/api/auth/me')
        ]);
        
        if (meRes.ok) {
          const data = await meRes.json();
          setCurrentUser(data.user);
        }

        if (subjRes.ok) setSubjectsList(await subjRes.json());
        if (booksRes.ok) setBooksList(await booksRes.json());
        if (chapRes.ok) setChaptersList(await chapRes.json());
        if (topRes.ok) setTopicsList(await topRes.json());
        if (classesRes.ok) setClassesList(await classesRes.json());
        if (usersRes.ok) {
          const data = await usersRes.json();
          const formatName = (u: any) => `${u.firstName} ${u.lastName}`.trim();
          setStudentsList(data.students?.map(formatName) || []);
        }
      } catch (error) {
        console.error('Failed to fetch metadata', error);
      }
    }
    
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        let url = '/api/tasks';
        const params = new URLSearchParams();
        if (filterStartDate) params.append('startDate', filterStartDate);
        if (filterEndDate) params.append('endDate', filterEndDate);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const tasksRes = await fetch(url);
        if (tasksRes.ok) {
          const json = await tasksRes.json();
          setTasks(json.data || json);
        }
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce the fetch to avoid spamming the backend while typing date/time
    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filterStartDate, filterEndDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return '#007AFF';
      case 'DONE': return '#237f5d';
      case 'PENDING': return '#f0be39';
      case 'OPEN': default: return '#64748b';
    }
  };

  const handleEditClick = (task: any, field: string) => {
    if (field === 'obtainedMarks' && currentUser?.role === 'STUDENT') return;
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

  const handleReschedule = async (originalTaskId: number, targetDate: Date) => {
    try {
      const formattedDate = targetDate.toISOString();
      const res = await fetch('/api/tasks/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalTaskId, newDate: formattedDate })
      });
      if (!res.ok) throw new Error('Failed to reschedule task');
      
      const newTasks = await res.json();
      
      setTasks(prev => {
        let updated = [...prev];
        const originalIndex = updated.findIndex(t => t.id === originalTaskId);
        if (originalIndex !== -1) {
          updated[originalIndex] = newTasks.originalTask;
        }
        updated.push(newTasks.newTask);
        return updated;
      });

      alert(`Task successfully rescheduled to ${targetDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Error rescheduling task:', error);
      alert('Failed to reschedule task');
    } finally {
      setIsRescheduleDatePickerOpen(false);
      setRescheduleDate(null);
      setRescheduleTaskId(null);
    }
  };

  const handleSaveEditDirect = async (taskId: number, field: string, value: string) => {
    if (field === 'status' && value === 'PENDING') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        if (task.rescheduledToId) {
          alert('This task has already been rescheduled!');
          return;
        }
        setRescheduleTaskId(taskId);
        const dt = task.dueDate ? new Date(task.dueDate) : new Date();
        setRescheduleDate(dt);
        setRescheduleCalendarMonth(new Date(dt.getFullYear(), dt.getMonth(), 1));
        setIsRescheduleDatePickerOpen(true);
      }
      return;
    }

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
    let isDate = false;
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
    } else if (field === 'dueDate') {
      isDate = true;
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
      let inputValue = editValue;
      if (isDate && editValue) {
        try {
          inputValue = new Date(editValue).toISOString().split('T')[0];
        } catch {
          inputValue = '';
        }
      }

      return (
        <input 
          type={isDate ? "date" : (field === 'obtainedMarks' ? 'number' : 'text')} 
          min={field === 'obtainedMarks' ? 0 : undefined}
          max={field === 'obtainedMarks' ? (task.totalMarks || 10) : undefined}
          step={field === 'obtainedMarks' ? 0.5 : undefined}
          value={inputValue} 
          onChange={e => {
            let val = e.target.value;
            if (field === 'obtainedMarks' && val) {
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 0) val = '0';
                if (num > (task.totalMarks || 10)) val = String(task.totalMarks || 10);
              }
            }
            setEditValue(val);
          }}
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
        style={{ cursor: 'pointer', display: 'inline-block', minWidth: '30px', minHeight: '20px', color: field === 'obtainedMarks' ? getMarksColor(task.obtainedMarks, task.totalMarks) : 'inherit', fontWeight: field === 'obtainedMarks' ? 'bold' : 'normal' }}
      >
        {field === 'dueDate' && task[field] ? new Date(task[field]).toLocaleDateString() : (task[field] || '-')}
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

    const filteredTasks = tasks.filter(t => {
      const matchesSearch = !searchQuery || Object.values(t).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesStatus = !filterStatus || (t.status || 'OPEN') === filterStatus;
      const matchesTaskType = !filterTaskType || (t.taskType || 'Home Work') === filterTaskType;
      const matchesAssignee = !filterAssignee || t.assignee === filterAssignee;
      const matchesSubject = !filterSubject || t.subject === filterSubject;
      const matchesClass = !filterClass || t.className === filterClass;
      
      let matchesDate = true;
      if (filterStartDate || filterEndDate) {
        const tDate = new Date(t.createdAt).getTime();
        
        if (filterStartDate) {
          const start = new Date(filterStartDate).getTime();
          if (tDate < start) matchesDate = false;
        }
        if (filterEndDate) {
          const end = new Date(filterEndDate).getTime();
          if (tDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesTaskType && matchesAssignee && matchesSubject && matchesClass && matchesDate;
    });

    if (filteredTasks.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No tasks match your filters.</div>;
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
      'Att.',
      'Status',
      'Obt. Marks',
      'Due Date',
      'Created By',
      'Date Added'
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mx-4 md:mx-8">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
              {headers.map(h => <th key={h} className="p-2 md:p-4 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((item, idx) => (
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
                <td className="p-2 md:p-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {item.images && item.images.length > 0 ? (
                      <button onClick={() => { setPreviewImages(item.images); setPreviewIndex(0); setPreviewTask(item); }} className="text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1" title={`View ${item.images.length} attachments`}>
                        <i className="fa-solid fa-paperclip"></i>
                        <span className="text-xs font-semibold">{item.images.length}</span>
                      </button>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                    {(!item.images || item.images.length < 5) && (
                      <div className="relative inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 cursor-pointer transition-colors" title="Add Image">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              try {
                                const compressedBlob = await compressImage(file);
                                const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
                                setTargetTaskForCrop(item);
                                setCropFile(compressedFile);
                              } catch (err) {
                                console.error('Compress error', err);
                              }
                              e.target.value = '';
                            }
                          }}
                        />
                        <i className="fa-solid fa-plus text-gray-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'status')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.status === 'DONE' ? renderEditableCell(item, 'obtainedMarks') : '-'}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{renderEditableCell(item, 'dueDate')}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{item.createdBy}</td>
                <td className="p-2 md:p-4 text-sm text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));
  const uniqueClasses = Array.from(new Set(tasks.map(t => t.className).filter(Boolean)));

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterTaskType('');
    setFilterAssignee('');
    setFilterSubject('');
    setFilterClass('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const activeFilters = [
    ...(filterStatus ? [{ type: 'Status', value: filterStatus, clear: () => setFilterStatus('') }] : []),
    ...(filterTaskType ? [{ type: 'Type', value: filterTaskType, clear: () => setFilterTaskType('') }] : []),
    ...(filterAssignee ? [{ type: 'Assignee', value: filterAssignee, clear: () => setFilterAssignee('') }] : []),
    ...(filterSubject ? [{ type: 'Subject', value: filterSubject, clear: () => setFilterSubject('') }] : []),
    ...(filterClass ? [{ type: 'Class', value: filterClass, clear: () => setFilterClass('') }] : []),
    ...(filterStartDate ? [{ type: 'From Date', value: filterStartDate.replace('T', ' '), clear: () => setFilterStartDate('') }] : []),
    ...(filterEndDate ? [{ type: 'To Date', value: filterEndDate.replace('T', ' '), clear: () => setFilterEndDate('') }] : []),
  ];
  const activeFilterCount = activeFilters.length;

  return (
    <main className="w-auto pb-8 -mt-4 md:-mt-8 -mx-4 md:-mx-8" style={{ maxWidth: 'none' }}>

      <div className="py-2 px-4 md:px-8 mb-4" style={{ backgroundColor: '#0f766e' }}>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <h2 className="text-lg font-bold text-white hidden md:block whitespace-nowrap">Tasks Directory</h2>
          
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Global search across all fields..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-shadow"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 border rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isFiltersExpanded || activeFilterCount > 0 
                  ? 'bg-teal-50 border-teal-200 text-teal-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters {activeFilterCount > 0 && <span className="bg-teal-500 text-white rounded-full px-2 py-0.5 text-xs ml-1">{activeFilterCount}</span>}
            </button>
            
            {(activeFilterCount > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isFiltersExpanded && (
          <div className="mt-4 p-4 bg-teal-50/50 rounded-md border border-teal-100 animate-slide-up">
            <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div>
                <label className="block text-xs text-teal-700/70 mb-1">From Date</label>
                <input 
                  type="datetime-local"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">To Date</label>
                <input 
                  type="datetime-local"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Status</label>
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING">Pending</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Task Type</label>
                <select 
                  value={filterTaskType}
                  onChange={e => setFilterTaskType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Home Work">Home Work</option>
                  <option value="Tuition Work">Tuition Work</option>
                  <option value="Class Work">Class Work</option>
                  <option value="Test">Test</option>
                  <option value="Project">Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Assignee</label>
                <select 
                  value={filterAssignee}
                  onChange={e => setFilterAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Assignees</option>
                  {studentsList.map((a: any) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Subject</label>
                <select 
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Subjects</option>
                  {subjectsList.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Class</label>
                <select 
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Classes</option>
                  {classesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 animate-fade-in">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-1">Active Filters:</span>
            {activeFilters.map(f => (
              <span key={f.type} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 shadow-sm transition-all hover:shadow">
                <span className="opacity-70">{f.type}:</span> {f.value}
                <button onClick={f.clear} className="hover:bg-teal-200 hover:text-teal-900 rounded-full p-0.5 ml-1 transition-colors focus:outline-none" aria-label={`Remove ${f.type} filter`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
            <button 
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-800 underline ml-2 transition-colors focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      <div className="animate-slide-up w-full">
        {renderTable()}
      </div>

      {/* Reschedule Date Picker Modal */}
      {isRescheduleDatePickerOpen && (
        <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => { setIsRescheduleDatePickerOpen(false); setRescheduleDate(null); setRescheduleTaskId(null); }}>
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 w-[320px] max-w-full transform transition-all outline-none" 
            onClick={e => e.stopPropagation()}
            tabIndex={0}
            ref={el => el?.focus()}
            onKeyDown={(e) => {
              if (!rescheduleDate) return;
              const newDate = new Date(rescheduleDate);
              if (e.key === 'ArrowRight') {
                newDate.setDate(newDate.getDate() + 1);
              } else if (e.key === 'ArrowLeft') {
                newDate.setDate(newDate.getDate() - 1);
              } else if (e.key === 'ArrowUp') {
                newDate.setDate(newDate.getDate() - 7);
              } else if (e.key === 'ArrowDown') {
                newDate.setDate(newDate.getDate() + 7);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (rescheduleTaskId) handleReschedule(rescheduleTaskId, rescheduleDate);
                return;
              } else {
                return;
              }
              e.preventDefault();
              e.stopPropagation();
              setRescheduleDate(newDate);
              if (newDate.getMonth() !== rescheduleCalendarMonth.getMonth() || newDate.getFullYear() !== rescheduleCalendarMonth.getFullYear()) {
                setRescheduleCalendarMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
              }
            }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Reschedule Date</h3>
            {(() => {
              const reschDaysInMonth = new Date(rescheduleCalendarMonth.getFullYear(), rescheduleCalendarMonth.getMonth() + 1, 0).getDate();
              const reschFirstDayOfMonth = new Date(rescheduleCalendarMonth.getFullYear(), rescheduleCalendarMonth.getMonth(), 1).getDay();
              
              return (
                <div className="select-none">
                  <div className="flex justify-between items-center mb-4">
                    <button 
                      onClick={() => setRescheduleCalendarMonth(new Date(rescheduleCalendarMonth.getFullYear(), rescheduleCalendarMonth.getMonth() - 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="font-semibold text-gray-800">
                      {rescheduleCalendarMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={() => setRescheduleCalendarMonth(new Date(rescheduleCalendarMonth.getFullYear(), rescheduleCalendarMonth.getMonth() + 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-400">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: reschFirstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: reschDaysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const isSelected = rescheduleDate && rescheduleDate.getDate() === d && rescheduleDate.getMonth() === rescheduleCalendarMonth.getMonth() && rescheduleDate.getFullYear() === rescheduleCalendarMonth.getFullYear();
                      return (
                        <div 
                          key={d} 
                          onClick={() => {
                            const newDate = new Date(rescheduleCalendarMonth.getFullYear(), rescheduleCalendarMonth.getMonth(), d);
                            setRescheduleDate(newDate);
                          }}
                          className={`
                            aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer transition-all
                            ${isSelected ? 'bg-teal-600 text-white font-bold shadow-md transform scale-110' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'}
                          `}
                        >
                          {d}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsRescheduleDatePickerOpen(false);
                  setRescheduleDate(null);
                  setRescheduleTaskId(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rescheduleTaskId && rescheduleDate) {
                    handleReschedule(rescheduleTaskId, rescheduleDate);
                  }
                }}
                disabled={!rescheduleDate}
                className="px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow active:scale-95"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImages && (
        <ImagePreview
          images={previewImages}
          initialIndex={previewIndex}
          onClose={() => {
            setPreviewImages(null);
            setPreviewIndex(0);
            setPreviewTask(null);
          }}
          onDelete={async (idxToDelete) => {
            if (previewTask) {
              const newImages = previewTask.images.filter((_: any, i: number) => i !== idxToDelete);
              setPreviewImages(newImages.length > 0 ? newImages : null);
              setTasks(prev => prev.map(t => t.id === previewTask.id ? { ...t, images: newImages } : t));
              try {
                await fetch('/api/tasks', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: previewTask.id, fieldName: 'images', newValue: newImages })
                });
              } catch (err) {
                console.error('Failed to delete image:', err);
              }
            }
          }}
        />
      )}

      {cropFile && targetTaskForCrop && (
        <ImageCropper
          imageFile={cropFile}
          onCropComplete={async (croppedBlob) => {
            setCropFile(null);
            const formData = new FormData();
            formData.append('images', croppedBlob, 'cropped.jpg');
            
            // Try to match student
            const matchedStudentObj = studentsList.find(s => s.toLowerCase() === targetTaskForCrop.assignee?.trim().toLowerCase());
            
            formData.append('schoolName', currentUser?.schoolName || 'UnknownSchool');
            formData.append('className', targetTaskForCrop.className || 'UnknownClass');
            formData.append('subject', targetTaskForCrop.subject);
            formData.append('type', 'task');
            formData.append('taskId', targetTaskForCrop.id.toString());

            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              if (res.ok) {
                const data = await res.json();
                if (data.urls && data.urls.length > 0) {
                  const newImages = [...(targetTaskForCrop.images || []), ...data.urls];
                  // Optimistically update
                  setTasks(tasks.map(t => t.id === targetTaskForCrop.id ? { ...t, images: newImages } : t));
                  // Save to DB
                  fetch('/api/tasks', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: targetTaskForCrop.id, fieldName: 'images', newValue: newImages })
                  }).catch(err => console.error('Failed to save image array', err));
                }
              }
            } catch (err) {
              console.error('Failed to upload cropped image', err);
            }
            setTargetTaskForCrop(null);
          }}
          onCancel={() => {
            setCropFile(null);
            setTargetTaskForCrop(null);
          }}
        />
      )}
    </main>
  );
}
