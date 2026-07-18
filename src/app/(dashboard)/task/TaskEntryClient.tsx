'use client';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

import { useState, useEffect } from 'react';

export default function TaskEntryClient({ 
  currentUser, 
  initialValues, 
  onClose, 
  onSuccess 
}: { 
  currentUser: any; 
  initialValues?: any; 
  onClose?: () => void; 
  onSuccess?: () => void; 
}) {
  const [user, setUser] = useState<any>(currentUser);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // Form State
  const [subject, setSubject] = useState(initialValues?.subject || '');
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [exercise, setExercise] = useState('');
  const [description, setDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('OPEN');
  const [taskType, setTaskType] = useState('Home Work');
  const [reporter, setReporter] = useState('');
  const [assignee, setAssignee] = useState(initialValues?.assignee || '');
  const [dueDate, setDueDate] = useState(() => initialValues?.dueDate || getLocalDateString(new Date()));
  const [assigneeStatus, setAssigneeStatus] = useState<'PRESENT' | 'ABSENT' | 'LEAVE' | null>(null);
  const [assigneeReason, setAssigneeReason] = useState<string>('');
  
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function checkAttendance() {
      if (!dueDate || !assignee) {
        setAssigneeStatus(null);
        setAssigneeReason('');
        return;
      }
      try {
        const res = await fetch(`/api/attendance?date=${dueDate}&role=STUDENT`);
        if (res.ok) {
          const data = await res.json();
          const record = data.find((u: any) => `${u.firstName} ${u.lastName}`.trim().toLowerCase() === assignee.trim().toLowerCase());
          if (record && record.attendanceId && record.status !== 'PRESENT') {
            setAssigneeStatus(record.status);
            setAssigneeReason(record.reason || '');
          } else {
            setAssigneeStatus(null);
            setAssigneeReason('');
          }
        }
      } catch (err) {}
    }
    checkAttendance();
  }, [dueDate, assignee]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, subjRes, booksRes, chapRes, topRes] = await Promise.all([
          fetch(`/api/task-users?t=${Date.now()}`),
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/chapters'),
          fetch('/api/topics')
        ]);
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          const formatName = (u: any) => `${u.firstName} ${u.lastName}`.trim();
          
          const tList = data.teachers?.map(formatName) || [];
          const sList = data.students?.map(formatName) || [];
          const aList = data.admins?.map(formatName) || [];
          
          setTeachers([...tList, ...aList]);
          setStudentsList(data.students || []);
          
          const all = [...tList, ...sList, ...aList];
          setAllUsers(all);

          const oList = data.owners?.map(formatName) || [];
          const ownerName = oList.length > 0 ? oList[0] : '';
          
          if (currentUser) {
            const userName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
            
            if (currentUser.role !== 'STUDENT') {
              setReporter(userName);
            } else {
              setReporter(ownerName);
            }

            if (currentUser.role === 'STUDENT') {
              setAssignee(userName);
            }
          }
        }
        
        if (subjRes.ok) setSubjectsList(await subjRes.json());
        if (booksRes.ok) setBooksList(await booksRes.json());
        if (chapRes.ok) setChaptersList(await chapRes.json());
        if (topRes.ok) setTopicsList(await topRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (assigneeStatus === 'ABSENT' || assigneeStatus === 'LEAVE') {
      const confirmSubmit = window.confirm(`Warning: The selected assignee (${assignee}) is marked as ${assigneeStatus} for the selected date. Are you sure you want to save this task?`);
      if (!confirmSubmit) return;
    }

    setStatus({ type: '', message: '' });
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: `${user.firstName} ${user.lastName}`.trim(),
          className: derivedClassName,
          subject,
          book,
          chapter,
          topic,
          exercise,
          description,
          reporter,
          assignee,
          status: taskStatus,
          taskType,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      setStatus({ type: 'success', message: 'Task created successfully!' });
      setSubject('');
      setBook('');
      setChapter('');
      setTopic('');
      setExercise('');
      setDescription('');
      setTaskStatus('OPEN');
      setTaskType('Home Work');
      setDueDate(getLocalDateString(new Date()));
      
      const userName = `${user.firstName} ${user.lastName}`.trim();
      if (user.role === 'STUDENT') {
        setAssignee(userName);
      } else {
        setAssignee('');
      }

      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div style={{ padding: '2rem' }}>Please log in to view this page.</div>;
  if (loading) return <div style={{ padding: '2rem' }}>Loading user data...</div>;

  const isStudent = user.role === 'STUDENT';
  const userName = `${user.firstName} ${user.lastName}`.trim();

  let derivedClassName = user.className || '';
  let assignedStudent: any = null;
  if (assignee) {
    assignedStudent = studentsList.find(s => 
      `${s.firstName} ${s.lastName}`.trim().toLowerCase() === assignee.trim().toLowerCase()
    );
    if (assignedStudent && assignedStudent.className) {
      derivedClassName = assignedStudent.className;
    } else {
      derivedClassName = '';
    }
  }

  const availableSubjects = subjectsList.filter(subj => {
    if (assignedStudent && assignedStudent.subjects && assignedStudent.subjects.length > 0) {
      return assignedStudent.subjects.includes(subj.name);
    }
    return true;
  });

  const availableBooks = booksList.filter(b => 
    b.subject === subject && 
    (b.className || '').includes(derivedClassName)
  );
  const availableChapters = chaptersList.filter(c => c.subject === subject && c.book === book);
  const availableTopics = topicsList.filter(t => t.subject === subject && t.book === book && (t.chapterTitle === chapter || t.chapterName === chapter));
  
  const uniqueTopicNames = Array.from(new Set(availableTopics.map(t => t.topicName).filter(Boolean)));
  const uniqueExercises = Array.from(new Set(availableTopics.map(t => t.exercise).filter(Boolean)));

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    const matchedEntry = availableTopics.find(t => t.topicName === newTopic && t.exercise);
    if (matchedEntry && matchedEntry.exercise) {
      setExercise(matchedEntry.exercise);
    }
  };

  const handleExerciseChange = (newExercise: string) => {
    setExercise(newExercise);
    const matchedEntry = availableTopics.find(t => t.exercise === newExercise && t.topicName);
    if (matchedEntry && matchedEntry.topicName) {
      setTopic(matchedEntry.topicName);
    }
  };

  const isPreFilledModal = !!(onClose && assignee);
  const showBeautifulHeader = isPreFilledModal && user.role === 'TEACHER';
  const showBeautifulHeaderForOwner = isPreFilledModal && (user.role === 'OWNER' || user.role === 'COORDINATOR');

  const renderBeautifulHeader = () => {
    return (
      <div className="bg-teal-50 border-l-[3px] md:border-l-4 border-teal-500 p-2 md:p-5 mb-3 md:mb-8 rounded shadow-sm grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-12">
        <div className="w-full md:w-auto">
          <span className="block text-[8px] md:text-xs uppercase tracking-wider text-teal-700/60 font-bold mb-0 md:mb-1">Created By</span>
          <span className="text-xs md:text-base text-gray-900 font-semibold truncate block leading-tight">{userName}</span>
        </div>
        <div className="w-full md:w-auto">
          <span className="block text-[8px] md:text-xs uppercase tracking-wider text-teal-700/60 font-bold mb-0 md:mb-1">Class</span>
          <span className="text-xs md:text-base text-gray-900 font-semibold truncate block leading-tight">{derivedClassName || 'N/A'}</span>
        </div>
        {initialValues?.subject && (
          <div className="w-full md:w-auto">
            <span className="block text-[8px] md:text-xs uppercase tracking-wider text-teal-700/60 font-bold mb-0 md:mb-1">Subject</span>
            <span className="text-xs md:text-base text-gray-900 font-semibold truncate block leading-tight">{subject}</span>
          </div>
        )}
        <div className="w-full md:w-auto">
          <span className="block text-[8px] md:text-xs uppercase tracking-wider text-teal-700/60 font-bold mb-0 md:mb-1">Assignee</span>
          <span className="text-xs md:text-base text-gray-900 font-semibold truncate block leading-tight">
            {assignee}
            {(assigneeStatus === 'ABSENT' || assigneeStatus === 'LEAVE') && (
              <span className="text-red-500 ml-1 text-sm" title={`Marked ${assigneeStatus}`}>⚠️ ({assigneeStatus})</span>
            )}
          </span>
        </div>
        {user.role === 'TEACHER' && (
          <div className="w-full md:w-auto">
            <span className="block text-[8px] md:text-xs uppercase tracking-wider text-teal-700/60 font-bold mb-0 md:mb-1">Reporter</span>
            <span className="text-xs md:text-base text-gray-900 font-semibold truncate block leading-tight">{reporter}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel animate-slide-up mx-auto max-w-4xl mt-0 md:mt-8 p-4 md:p-8 w-full" style={{ position: 'relative', maxHeight: onClose ? '85vh' : 'auto', overflowY: onClose ? 'auto' : 'visible' }}>
      {onClose && (
        <button 
          onClick={onClose}
          type="button"
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', zIndex: 10, color: '#6b7280' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}


      {(showBeautifulHeader || showBeautifulHeaderForOwner) && renderBeautifulHeader()}

      {(assigneeStatus === 'ABSENT' || assigneeStatus === 'LEAVE') && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 shadow-sm animate-pulse">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <strong className="block mb-0.5 text-red-800">Warning: Assignee is {assigneeStatus}</strong>
            <span>{assigneeReason || `The selected assignee (${assignee}) is currently marked as ${assigneeStatus.toLowerCase()} for the selected date.`}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          
          {!(showBeautifulHeader || showBeautifulHeaderForOwner) && (
            <>
              <div className="form-group">
                <label className="form-label">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={userName} 
                  disabled 
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Class</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={derivedClassName || 'N/A'} 
                  disabled 
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
              </div>

              <div className="form-group col-span-2">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Reporter <span className="text-red-500">*</span></label>
                    <select 
                      className="form-control" 
                      value={reporter} 
                      onChange={e => setReporter(e.target.value)} 
                      required
                    >
                      <option value="" disabled>Select Reporter</option>
                      {teachers.map((u, i) => (
                        <option key={i} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assignee <span className="text-red-500 ml-1">*</span></label>
                    {isStudent ? (
                      <input 
                        type="text" 
                        className="form-control" 
                        value={assignee} 
                        disabled 
                        style={{ backgroundColor: 'var(--border-color)' }}
                      />
                    ) : (
                      <select 
                        className="form-control" 
                        value={assignee} 
                        onChange={e => setAssignee(e.target.value)} 
                        required
                      >
                        <option value="" disabled>Select Assignee</option>
                        {allUsers.map((u, i) => (
                          <option key={i} value={u}>{u}</option>
                        ))}
                      </select>
                    )}
                    {(assigneeStatus === 'ABSENT' || assigneeStatus === 'LEAVE') && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-1.5 flex items-start gap-1.5">
                        <span className="text-sm">⚠️</span>
                        <span>
                          <strong>{assigneeStatus}:</strong> {assigneeReason || 'No reason provided.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}

          {(!(showBeautifulHeader || showBeautifulHeaderForOwner) || !initialValues?.subject) && (
            <div className="form-group">
              <label className="form-label">Subject <span className="text-red-500 ml-1">*</span></label>
              <select 
                className="form-control" 
                value={subject} 
                onChange={e => {
                  setSubject(e.target.value);
                  setBook('');
                  setChapter('');
                  setTopic('');
                  setExercise('');
                }} 
                required
              >
                <option value="" disabled>Select Subject</option>
                {availableSubjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {showBeautifulHeaderForOwner && (
            <div className="form-group">
              <label className="form-label">Reporter <span className="text-red-500">*</span></label>
              <select 
                className="form-control" 
                value={reporter} 
                onChange={e => setReporter(e.target.value)} 
                required
              >
                <option value="" disabled>Select Reporter</option>
                {teachers.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Book</label>
            <select 
              className="form-control" 
              value={book} 
              onChange={e => {
                setBook(e.target.value);
                setChapter('');
                setTopic('');
                setExercise('');
              }} 
              disabled={!subject}
            >
              <option value="" disabled>Select Book</option>
              {availableBooks.map(b => (
                <option key={b.id} value={b.title}>{b.title} Edition {b.edition}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chapter</label>
            <select 
              className="form-control" 
              value={chapter} 
              onChange={e => {
                setChapter(e.target.value);
                setTopic('');
                setExercise('');
              }} 
              disabled={!book}
            >
              <option value="" disabled>Select Chapter</option>
              {availableChapters.map(c => (
                <option key={c.id} value={c.chapterTitle || c.chapterName}>{c.chapterTitle || c.chapterName}</option>
              ))}
            </select>
            {!book && <p className="text-[10px] text-gray-400 mt-1 italic">Please select a book first.</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Topic</label>
            <select 
              className="form-control" 
              value={topic} 
              onChange={e => handleTopicChange(e.target.value)} 
              disabled={!chapter}
            >
              <option value="" disabled>Select Topic (Optional)</option>
              {uniqueTopicNames.map((tName, i) => (
                <option key={i} value={tName as string}>{tName as string}</option>
              ))}
            </select>
            {!chapter && <p className="text-[10px] text-gray-400 mt-1 italic">Please select a chapter first.</p>}
          </div>

          {uniqueExercises.length > 0 && (
            <div className="form-group">
              <label className="form-label">Exercise</label>
              <select 
                className="form-control" 
                value={exercise} 
                onChange={e => handleExerciseChange(e.target.value)} 
                disabled={!chapter}
              >
                <option value="" disabled>Select Exercise (Optional)</option>
                {uniqueExercises.map((ex, i) => (
                  <option key={i} value={ex as string}>{ex as string}</option>
                ))}
              </select>
            </div>
          )}

        </div>

        <div className="form-row mt-2 md:mt-4">
          <div className="form-group">
            <label className="form-label">Task Type <span className="text-red-500 ml-1">*</span></label>
            <select 
              className="form-control" 
              value={taskType} 
              onChange={e => setTaskType(e.target.value)} 
              required
            >
              <option value="Home Work">Home Work</option>
              <option value="Tuition Work">Tuition Work</option>
              <option value="Class Work">Class Work</option>
              <option value="Test">Test</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status <span className="text-red-500 ml-1">*</span></label>
            <select 
              className="form-control" 
              value={taskStatus} 
              onChange={e => setTaskStatus(e.target.value)} 
              required
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date <span className="text-red-500 ml-1">*</span></label>
            <div className="relative">
              <input 
                type="date" 
                className="form-control pl-10 md:pl-10" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                required
              />
              <i className="fa-regular fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        <div className="form-group mt-2 md:mt-4">
          <label className="form-label">Description <span className="text-red-500 ml-1">*</span></label>
          <textarea 
            className="form-control" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            required 
            rows={4}
            placeholder="Enter task description"
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        {status.message && (
          <div className={`status-message ${status.type === 'error' ? 'status-error' : 'status-success'}`} style={{ marginBottom: '1.5rem' }}>
            {status.message}
          </div>
        )}

        <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-gray-100">
          {onClose && (
            <button 
              type="button" 
              tabIndex={0}
              onClick={onClose} 
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-medium text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button type="submit" tabIndex={0} className="btn-submit m-0 px-8 py-2 w-auto flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            ) : null}
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
