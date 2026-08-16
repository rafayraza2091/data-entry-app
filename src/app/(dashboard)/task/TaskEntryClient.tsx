'use client';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

import { useState, useEffect, useRef } from 'react';
import ImageCropper from '@/components/ImageCropper';
import { compressImage } from '@/lib/compressImage';

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
  const [totalMarks, setTotalMarks] = useState('10');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [assigneeStatus, setAssigneeStatus] = useState<'PRESENT' | 'ABSENT' | 'LEAVE' | null>(null);
  const [assigneeReason, setAssigneeReason] = useState<string>('');
  
  const [status, setStatus] = useState({ type: '', message: '' });

  // Image Upload State
  const [croppedImages, setCroppedImages] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    const timer = setTimeout(() => {
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus({ preventScroll: true });
        const len = descriptionInputRef.current.value.length;
        descriptionInputRef.current.setSelectionRange(len, len);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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
      let imageUrls: string[] = [];
      if (croppedImages.length > 0) {
        const formData = new FormData();
        croppedImages.forEach(blob => {
          formData.append('images', blob, 'cropped.jpg');
        });
        formData.append('schoolName', user.schoolName || 'UnknownSchool');
        formData.append('className', derivedClassName || 'UnknownClass');
        formData.append('subject', subject);
        formData.append('type', 'task');
        formData.append('taskId', 'new');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error || 'Failed to upload images');
        }
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls || [];
      }

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
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          totalMarks: taskStatus === 'DONE' && totalMarks ? totalMarks : undefined,
          obtainedMarks: taskStatus === 'DONE' && obtainedMarks ? obtainedMarks : undefined,
          images: imageUrls
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
      setTotalMarks('');
      setObtainedMarks('');
      setCroppedImages([]);
      
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

  const availableBooks = booksList.filter(b => {
    if (b.subject !== subject) return false;
    if (!derivedClassName) return true;
    const targetLower = derivedClassName.trim().toLowerCase();
    const bookClasses = (b.className || '').split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
    return bookClasses.length === 0 || bookClasses.some((c: string) => c === targetLower || c.includes(targetLower) || targetLower.includes(c));
  });

  const classBookTitles = new Set(availableBooks.map(b => b.title));

  const availableChapters = chaptersList.filter(c => 
    c.subject === subject && 
    (book ? c.book === book : (classBookTitles.size === 0 || classBookTitles.has(c.book)))
  );

  const chaptersByBook = availableChapters.reduce<Record<string, typeof availableChapters>>((acc, c) => {
    const bName = c.book || 'Other';
    if (!acc[bName]) acc[bName] = [];
    acc[bName].push(c);
    return acc;
  }, {});

  const availableTopics = topicsList.filter(t => 
    t.subject === subject && 
    (book ? t.book === book : (classBookTitles.size === 0 || classBookTitles.has(t.book))) && 
    (t.chapterTitle === chapter || t.chapterName === chapter)
  );
  
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
    <div className="glass-panel animate-slide-up mx-auto max-w-4xl mt-0 md:mt-8 p-2 sm:p-6 md:p-8 w-full" style={{ position: 'relative', maxHeight: onClose ? '85vh' : 'auto', overflowY: onClose ? 'auto' : 'visible' }}>
      {onClose && (
        <button 
          onClick={onClose}
          type="button"
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', zIndex: 10, color: '#6b7280' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}


      {(showBeautifulHeader || showBeautifulHeaderForOwner) && renderBeautifulHeader()}

      {(assigneeStatus === 'ABSENT' || assigneeStatus === 'LEAVE') && (
        <div className="mb-2 text-[10px] sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded p-1.5 flex items-start gap-1.5 shadow-xs animate-pulse">
          <span className="text-sm leading-none mt-0.5">⚠️</span>
          <div>
            <strong className="block mb-0.5 text-red-800">Warning: Assignee is {assigneeStatus}</strong>
            <span>{assigneeReason || `The selected assignee (${assignee}) is currently marked as ${assigneeStatus.toLowerCase()} for the selected date.`}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-1 sm:gap-3">
          
          {!(showBeautifulHeader || showBeautifulHeaderForOwner) && (
            <>
              {/* Row 1: Name & Class */}
              <div className="form-group mb-1 sm:mb-3">
                <label className="form-label text-[9px] sm:text-[11.5px]">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
                  value={userName} 
                  disabled 
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
              </div>

              <div className="form-group mb-1 sm:mb-3">
                <label className="form-label text-[9px] sm:text-[11.5px]">Class</label>
                <input 
                  type="text" 
                  className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
                  value={derivedClassName || 'N/A'} 
                  disabled 
                  style={{ backgroundColor: 'var(--border-color)' }}
                />
              </div>

              {/* Row 2: Reporter & Assignee */}
              <div className="form-group mb-1 sm:mb-3">
                <label className="form-label text-[9px] sm:text-[11.5px]">Reporter <span className="text-red-500">*</span></label>
                <select 
                  className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

              <div className="form-group mb-1 sm:mb-3">
                <label className="form-label text-[9px] sm:text-[11.5px]">Assignee <span className="text-red-500 ml-0.5">*</span></label>
                {isStudent ? (
                  <input 
                    type="text" 
                    className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
                    value={assignee} 
                    disabled 
                    style={{ backgroundColor: 'var(--border-color)' }}
                  />
                ) : (
                  <select 
                    className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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
                  <div className="mt-0.5 text-[9px] sm:text-xs text-red-600 bg-red-50 border border-red-200 rounded p-0.5 flex items-start gap-1 col-span-2">
                    <span className="text-[10px]">⚠️</span>
                    <span>
                      <strong>{assigneeStatus}:</strong> {assigneeReason || 'No reason provided.'}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Row 3: Subject & Book */}
          {(!(showBeautifulHeader || showBeautifulHeaderForOwner) || !initialValues?.subject) && (
            <div className="form-group mb-1 sm:mb-3">
              <label className="form-label text-[9px] sm:text-[11.5px]">Subject <span className="text-red-500 ml-0.5">*</span></label>
              <select 
                className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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
            <div className="form-group mb-1 sm:mb-3">
              <label className="form-label text-[9px] sm:text-[11.5px]">Reporter <span className="text-red-500">*</span></label>
              <select 
                className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

          <div className="form-group mb-1 sm:mb-3">
            <label className="form-label text-[9px] sm:text-[11.5px]">Book</label>
            <select 
              className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

          {/* Row 4: Chapter & Topic */}
          <div className="form-group mb-1 sm:mb-3">
            <label className="form-label text-[9px] sm:text-[11.5px]">Chapter</label>
            <select 
              className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
              value={chapter} 
              onChange={e => {
                const selectedChTitle = e.target.value;
                setChapter(selectedChTitle);
                const matchedCh = availableChapters.find(c => (c.chapterTitle || c.chapterName) === selectedChTitle);
                if (matchedCh && matchedCh.book && (!book || book !== matchedCh.book)) {
                  setBook(matchedCh.book);
                }
                setTopic('');
                setExercise('');
              }} 
            >
              <option value="" disabled>Select Chapter</option>
              {Object.keys(chaptersByBook).length <= 1 ? (
                availableChapters.map(c => (
                  <option key={c.id} value={c.chapterTitle || c.chapterName}>{c.chapterTitle || c.chapterName}</option>
                ))
              ) : (
                Object.entries(chaptersByBook).map(([bName, chList]) => (
                  <optgroup key={bName} label={`Book: ${bName}`}>
                    {chList.map(c => (
                      <option key={c.id} value={c.chapterTitle || c.chapterName}>{c.chapterTitle || c.chapterName}</option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
          </div>

          <div className="form-group mb-1 sm:mb-3">
            <label className="form-label text-[9px] sm:text-[11.5px]">Topic</label>
            <select 
              className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
              value={topic} 
              onChange={e => handleTopicChange(e.target.value)} 
              disabled={!chapter}
            >
              <option value="" disabled>Select Topic (Optional)</option>
              {uniqueTopicNames.map((tName, i) => (
                <option key={i} value={tName as string}>{tName as string}</option>
              ))}
            </select>
            {!chapter && <p className="text-[8px] text-gray-400 mt-0.5 italic">Select chapter first.</p>}
          </div>

          {uniqueExercises.length > 0 && (
            <div className="form-group mb-1 sm:mb-3 col-span-2 sm:col-span-1">
              <label className="form-label text-[9px] sm:text-[11.5px]">Exercise</label>
              <select 
                className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

          {/* Row 5: Task Type & Status */}
          <div className="form-group mb-1 sm:mb-3">
            <label className="form-label text-[9px] sm:text-[11.5px]">Task Type <span className="text-red-500 ml-0.5">*</span></label>
            <select 
              className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

          <div className="form-group mb-1 sm:mb-3">
            <label className="form-label text-[9px] sm:text-[11.5px]">Status <span className="text-red-500 ml-0.5">*</span></label>
            <select 
              className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
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

          {/* Row 6: Due Date & Obtained Marks (if Done) */}
          <div className="form-group mb-1 sm:mb-3 col-span-2 sm:col-span-1">
            <label className="form-label text-[9px] sm:text-[11.5px]">Due Date <span className="text-red-500 ml-0.5">*</span></label>
            <div className="relative">
              <input 
                type="date" 
                className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] pl-5 sm:pl-10 px-1 py-0" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                required
              />
              <i className="fa-regular fa-calendar absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-[9px] sm:text-xs pointer-events-none"></i>
            </div>
          </div>

          {taskStatus === 'DONE' && (
            <div className="form-group mb-1 sm:mb-3 col-span-2 sm:col-span-1">
              <label className="form-label text-[9px] sm:text-[11.5px]">Obtained Marks</label>
              <input 
                type="number" 
                step="0.5"
                min="0"
                className="form-control h-[26px] sm:h-[36px] text-[10px] sm:text-[13px] px-1 py-0" 
                value={obtainedMarks} 
                onChange={e => setObtainedMarks(e.target.value)} 
                placeholder="e.g. 8"
              />
            </div>
          )}

          {/* Full Width Row 7: Description */}
          <div className="form-group mb-1 sm:mb-3 col-span-2">
            <label className="form-label text-[9px] sm:text-[11.5px]">Description <span className="text-red-500 ml-0.5">*</span></label>
            <textarea 
              ref={descriptionInputRef}
              autoFocus
              className="form-control text-[10px] sm:text-[13px] min-h-[38px] sm:min-h-[72px] p-1 sm:p-2.5" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows={2}
              placeholder="Enter task description"
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

        {/* Attachments Section */}
        <div className="form-group mt-1 sm:mt-2 md:mt-3 col-span-2">
          <label className="form-label">Attachments (Max 5)</label>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            disabled={croppedImages.length >= 5}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                try {
                  const compressedBlob = await compressImage(file);
                  const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
                  setSelectedFile(compressedFile);
                  setIsCropping(true);
                } catch (err) {
                  console.error('Error compressing image', err);
                  alert('Failed to process image');
                }
                e.target.value = '';
              }
            }} 
            className="hidden" 
          />

          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={cameraInputRef}
            disabled={croppedImages.length >= 5}
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                try {
                  const compressedBlob = await compressImage(file);
                  const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
                  setSelectedFile(compressedFile);
                  setIsCropping(true);
                } catch (err) {
                  console.error('Error compressing image', err);
                  alert('Failed to process image');
                }
                e.target.value = '';
              }
            }} 
            className="hidden" 
          />

          <div className="flex gap-3 flex-wrap items-center mt-1">
            <button
              type="button"
              disabled={croppedImages.length >= 5}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors border border-gray-300 disabled:opacity-50"
            >
              <i className="fa-solid fa-folder-open text-gray-500"></i>
              <span>Choose File / Photos</span>
            </button>

            {isMobile && (
              <button
                type="button"
                disabled={croppedImages.length >= 5}
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors border border-teal-200 disabled:opacity-50"
              >
                <i className="fa-solid fa-camera text-teal-600"></i>
                <span>Take Photo (Camera)</span>
              </button>
            )}
          </div>
          {croppedImages.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {croppedImages.map((blob, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img 
                    src={URL.createObjectURL(blob)} 
                    alt="cropped preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove this image?")) {
                        setCroppedImages(prev => prev.filter((_, i) => i !== idx));
                      }
                    }}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', lineHeight: 1 }}
                    title="Remove image"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
    </div>
  );
}
