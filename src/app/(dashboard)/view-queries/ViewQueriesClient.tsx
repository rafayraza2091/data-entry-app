'use client';

import { useState, useEffect } from 'react';
import ImageCropper from '@/components/ImageCropper';

export default function ViewQueriesClient({ currentUser }: { currentUser: any }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ message: string, studentName: string } | null>(null);

  // Dropdown lists for the edit modal
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Editing state
  const [editingQuery, setEditingQuery] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image viewer state
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // New Image attachment state for editing
  const [croppedImages, setCroppedImages] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [sRes, bRes, tRes, usersRes, cRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/topics'),
          fetch(`/api/task-users?t=${Date.now()}`),
          fetch('/api/classes')
        ]);



        if (sRes.ok) setSubjectsList(await sRes.json());
        if (bRes.ok) setBooksList(await bRes.json());
        if (tRes.ok) setTopicsList(await tRes.json());
        if (cRes.ok) setClassesList(await cRes.json());
        if (usersRes.ok) {
          const uData = await usersRes.json();
          const formatName = (u: any) => `${u.firstName} ${u.lastName}`.trim();
          setTeachersList(uData.teachers?.map(formatName) || []);
          setStudentsList(uData.students?.map(formatName) || []);
        }
      } catch (err: any) {
        setError('Failed to fetch metadata: ' + err.message);
      } finally {
        // We do not set loading to false here because fetchQueries will handle it, 
        // or we can set it to false if fetchQueries finishes first. 
        // But fetchQueries handles its own loading state.
      }
    }

    if (currentUser) {
      fetchMetadata();
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchQueries() {
      setLoading(true);
      try {
        let url = '/api/queries';
        const params = new URLSearchParams();
        if (filterStartDate) params.append('startDate', filterStartDate);
        if (filterEndDate) params.append('endDate', filterEndDate);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const qRes = await fetch(url);
        if (!qRes.ok) throw new Error('Failed to fetch queries');
        const json = await qRes.json();
        const data = json.data || json;

        // Apply filtering based on role
        if (currentUser.role === 'STUDENT') {
          const studentFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
          const filtered = data.filter((q: any) => q.studentName === studentFullName);
          setQueries(filtered);
        } else {
          setQueries(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      const timeoutId = setTimeout(() => {
        fetchQueries();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, filterStartDate, filterEndDate]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuery) return;
    setIsSaving(true);

    try {
      let imageUrls = [...(editingQuery.images || [])];

      if (croppedImages.length > 0) {
        const formData = new FormData();
        croppedImages.forEach(blob => {
          formData.append('images', blob, 'cropped.jpg');
        });
        formData.append('schoolName', editingQuery.schoolName || 'UnknownSchool');
        formData.append('className', editingQuery.className || 'UnknownClass');
        formData.append('studentName', editingQuery.studentName || 'UnknownStudent');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error('Failed to upload new images');
        }
        const uploadData = await uploadRes.json();
        if (uploadData.urls) {
          imageUrls = [...imageUrls, ...uploadData.urls];
        }
      }

      const response = await fetch(`/api/queries/${editingQuery.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingQuery, images: imageUrls }),
      });

      if (response.ok) {
        const updated = await response.json();
        setQueries(queries.map(q => q.id === editingQuery.id ? updated : q));
        setEditingQuery(null);
        setCroppedImages([]);
      } else {
        console.error('Failed to update query');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (query: any, newStatus: string) => {
    try {
      const response = await fetch(`/api/queries/${query.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...query, status: newStatus }),
      });
      if (response.ok) {
        setQueries(queries.map(q => q.id === query.id ? { ...q, status: newStatus } : q));
        if (newStatus.toLowerCase() === 'done') {
          setNotification({
            studentName: query.studentName || '',
            message: query.queryStatement || '',
          });
          setTimeout(() => setNotification(null), 4000);
        }
      } else {
        console.error('Failed to change status');
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const renderStatusDropdown = (query: any) => {
    const s = (query.status || 'open').toLowerCase();
    
    let bgClass = "bg-gray-100 text-gray-700 border-gray-200";
    if (s === 'pending') bgClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (s === 'done') bgClass = "bg-green-50 text-green-700 border-green-200";

    return (
      <select
        value={s}
        onChange={(e) => handleStatusChange(query, e.target.value)}
        className={`px-2 py-1 border rounded text-xs font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${bgClass}`}
      >
        <option value="open">OPEN</option>
        <option value="pending">PENDING</option>
        <option value="done">DONE</option>
      </select>
    );
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const fetchImage = async () => {
        const response = await fetch(imageUrl);
        let blob = await response.blob();
        
        // Safari requires image/png for clipboard
        if (blob.type !== 'image/png') {
          blob = await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('No context'));
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = imageUrl;
          });
        }
        return blob;
      };

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': fetchImage()
        })
      ]);
      alert('Image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Failed to copy image. Your browser might not support this feature.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading queries...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  const uniqueTeachers = Array.from(new Set(queries.map(q => q.teacherName).filter(Boolean)));
  const uniqueStudents = Array.from(new Set(queries.map(q => q.studentName).filter(Boolean)));
  const uniqueClasses = Array.from(new Set(queries.map(q => q.className).filter(Boolean)));

  const filteredQueries = queries.filter(q => {
    const matchesSearch = !searchQuery || Object.values(q).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !filterStatus || (q.status || 'open').toLowerCase() === filterStatus.toLowerCase();
    const matchesTeacher = !filterTeacher || q.teacherName === filterTeacher;
    const matchesStudent = !filterStudent || q.studentName === filterStudent;
    const matchesSubject = !filterSubject || q.subject === filterSubject;
    const matchesClass = !filterClass || q.className === filterClass;
    
    let matchesDate = true;
    if (filterStartDate || filterEndDate) {
      const qDate = new Date(q.createdAt).getTime();
      
      if (filterStartDate) {
        const start = new Date(filterStartDate).getTime();
        if (qDate < start) matchesDate = false;
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate).getTime();
        if (qDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesTeacher && matchesStudent && matchesSubject && matchesClass && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterTeacher('');
    setFilterStudent('');
    setFilterSubject('');
    setFilterClass('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const activeFilters = [
    ...(filterStatus ? [{ type: 'Status', value: filterStatus, clear: () => setFilterStatus('') }] : []),
    ...(filterTeacher ? [{ type: 'Teacher', value: filterTeacher, clear: () => setFilterTeacher('') }] : []),
    ...(filterStudent ? [{ type: 'Student', value: filterStudent, clear: () => setFilterStudent('') }] : []),
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
          <h2 className="text-lg font-bold text-white hidden md:block whitespace-nowrap">Queries Directory</h2>
          
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
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Teacher</label>
                <select 
                  value={filterTeacher}
                  onChange={e => setFilterTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Teachers</option>
                  {teachersList.map((t: any) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">Student</label>
                <select 
                  value={filterStudent}
                  onChange={e => setFilterStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="">All Students</option>
                  {studentsList.map((s: any) => <option key={s} value={s}>{s}</option>)}
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
                  {subjectsList.map((s: any) => <option key={s.name} value={s.name}>{s.name}</option>)}
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

      {queries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No queries found.
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No queries match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mx-4 md:mx-8">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
                <th className="p-2 md:p-4 font-semibold">Date</th>
                <th className="p-2 md:p-4 font-semibold">Created By</th>
                <th className="p-2 md:p-4 font-semibold">Teacher</th>
                <th className="p-2 md:p-4 font-semibold">Student</th>
                <th className="p-2 md:p-4 font-semibold">Class</th>
                <th className="p-2 md:p-4 font-semibold">Subject</th>
                <th className="p-2 md:p-4 font-semibold">Book</th>
                <th className="p-2 md:p-4 font-semibold">Chapter</th>
                <th className="p-2 md:p-4 font-semibold">Topic</th>
                <th className="p-2 md:p-4 font-semibold">Exercise</th>
                <th className="p-2 md:p-4 font-semibold">Page Number</th>
                <th className="p-2 md:p-4 font-semibold min-w-[200px]">Query Statement</th>
                <th className="p-2 md:p-4 font-semibold">Attachments</th>
                <th className="p-2 md:p-4 font-semibold">Status</th>
                <th className="p-2 md:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((q, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 md:p-4 text-sm text-gray-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 md:p-4 text-sm font-medium text-teal-700">{q.createdBy || '-'}</td>
                  <td className="p-2 md:p-4 text-sm font-medium text-gray-900">{q.teacherName}</td>
                  <td className="p-2 md:p-4 text-sm font-medium text-gray-900">{q.studentName}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.className}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.subject}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.book || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.chapter || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.topic || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.exercise || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.pageNumber || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-700 max-w-[250px] truncate" title={q.queryStatement}>
                    {q.queryStatement}
                  </td>
                  <td className="p-2 md:p-4 text-sm">
                    {q.images && q.images.length > 0 ? (
                      <button 
                        onClick={() => { setViewingImages(q.images); setCurrentImageIndex(0); }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        Images ({q.images.length})
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2 md:p-4 text-sm">
                    {renderStatusDropdown(q)}
                  </td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">
                    <button 
                      onClick={() => setEditingQuery({ ...q })}
                      className="px-3 py-1 bg-teal-50 text-teal-600 rounded border border-teal-100 hover:bg-teal-100 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Edit Query</h2>
              <button onClick={() => setEditingQuery(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Non-editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <input type="text" disabled value={editingQuery.studentName} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                  <input type="text" disabled value={editingQuery.teacherName} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" disabled value={editingQuery.className} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                
                {/* Editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    value={editingQuery.subject || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, subject: e.target.value, book: '', topic: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjectsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book (Optional)</label>
                  <select 
                    value={editingQuery.book || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, book: e.target.value, topic: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Book</option>
                    {booksList.filter(b => b.subject === editingQuery.subject).map(b => (
                      <option key={b.id} value={b.title}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.chapter || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, chapter: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Optional)</label>
                  <select 
                    value={editingQuery.topic || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, topic: e.target.value, exercise: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Topic</option>
                    {topicsList
                      .filter(t => t.subject === editingQuery.subject && (editingQuery.book ? t.book === editingQuery.book : true))
                      .map((t, i) => <option key={i} value={t.topicName || ''}>{t.topicName}</option>)
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.exercise || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, exercise: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Number (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.pageNumber || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, pageNumber: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={editingQuery.status || 'open'} 
                    onChange={e => setEditingQuery({ ...editingQuery, status: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Query Statement</label>
                  <textarea 
                    value={editingQuery.queryStatement || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, queryStatement: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                    required
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">Add More Attachments</label>
                
                <input
                  type="file"
                  accept="image/*"
                  id="edit-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      setIsCropping(true);
                    }
                    e.target.value = '';
                  }}
                />
                
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Current existing images */}
                  {editingQuery.images?.map((url: string, index: number) => (
                    <div key={`existing-${index}`} className="relative border border-gray-200 rounded p-1">
                      <img 
                        src={url} 
                        alt="Existing Attachment" 
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this image?")) {
                            setEditingQuery({
                              ...editingQuery,
                              images: editingQuery.images.filter((_: any, i: number) => i !== index)
                            });
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm text-sm"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {/* New cropped images preview */}
                  {croppedImages.map((blob, index) => (
                    <div key={`new-${index}`} className="relative border border-teal-200 bg-teal-50 rounded p-1">
                      <img 
                        src={URL.createObjectURL(blob)} 
                        alt="New Cropped preview" 
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to remove this image?")) {
                            setCroppedImages(prev => prev.filter((_, i) => i !== index));
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm text-sm"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <button
                    type="button"
                    onClick={() => document.getElementById('edit-file-upload')?.click()}
                    className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded hover:bg-gray-50 hover:border-teal-500 hover:text-teal-600 transition-colors text-gray-500"
                  >
                    <span className="text-2xl mb-1">+</span>
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setEditingQuery(null); setCroppedImages([]); }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4">
          <div className="absolute top-6 right-6 flex items-center gap-6 z-50">
            <button
              onClick={() => copyImageToClipboard(viewingImages[currentImageIndex])}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition-colors font-medium text-sm border border-white/40 backdrop-blur-sm"
              title="Copy Image"
            >
              Copy Image
            </button>
            <button 
              onClick={() => setViewingImages([])}
              className="text-white hover:text-gray-300 text-4xl leading-none"
              title="Close"
            >
              &times;
            </button>
          </div>
          
          <div className="relative flex items-center justify-center w-full max-w-5xl h-full max-h-[80vh]">
            {viewingImages.length > 1 && (
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : viewingImages.length - 1))}
                className="absolute left-0 text-white hover:text-gray-300 text-5xl px-4 py-8"
              >
                &#8249;
              </button>
            )}
            
            <img 
              src={viewingImages[currentImageIndex]} 
              alt={`Attachment ${currentImageIndex + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
            
            {viewingImages.length > 1 && (
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev < viewingImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-0 text-white hover:text-gray-300 text-5xl px-4 py-8"
              >
                &#8250;
              </button>
            )}
          </div>
          
          {viewingImages.length > 1 && (
            <div className="text-white mt-4 text-lg">
              {currentImageIndex + 1} / {viewingImages.length}
            </div>
          )}
        </div>
      )}

      {/* Image Cropper Modal */}
      {isCropping && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={(croppedBlob) => {
            setCroppedImages(prev => [...prev, croppedBlob]);
            setIsCropping(false);
            setSelectedFile(null);
          }}
          onCancel={() => {
            setIsCropping(false);
            setSelectedFile(null);
          }}
        />
      )}

      {/* Sleek Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-white border-l-4 border-green-500 shadow-xl rounded-lg p-4 flex items-start space-x-3 max-w-sm">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Query Resolved</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium text-gray-800">{notification.studentName}'s</span> query has been marked as done.
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">"{notification.message}"</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
