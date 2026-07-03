'use client';

import { useState, useEffect } from 'react';

export default function TaskEntryClient({ currentUser }: { currentUser: any }) {
  const [user, setUser] = useState<any>(currentUser);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Form State
  const [subject, setSubject] = useState('');
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [exercise, setExercise] = useState('');
  const [description, setDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('OPEN');
  const [reporter, setReporter] = useState('');
  const [assignee, setAssignee] = useState('');
  
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, subjRes, booksRes, chapRes, topRes] = await Promise.all([
          fetch('/api/task-users'),
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
            setReporter(ownerName);
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
    setStatus({ type: '', message: '' });

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
          status: taskStatus
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
      
      const userName = `${user.firstName} ${user.lastName}`.trim();
      if (user.role === 'STUDENT') {
        setAssignee(userName);
      } else {
        setAssignee('');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  if (!user) return <div style={{ padding: '2rem' }}>Please log in to view this page.</div>;
  if (loading) return <div style={{ padding: '2rem' }}>Loading user data...</div>;

  const isStudent = user.role === 'STUDENT';
  const userName = `${user.firstName} ${user.lastName}`.trim();

  let derivedClassName = user.className || '';
  if (!isStudent && assignee) {
    const assignedStudent = studentsList.find(s => `${s.firstName} ${s.lastName}`.trim() === assignee);
    if (assignedStudent && assignedStudent.className) {
      derivedClassName = assignedStudent.className;
    }
  }

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

  return (
    <div className="glass-panel animate-slide-up" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-color)' }}>
        Task Entry
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          <div className="form-group">
            <label className="form-label">Name</label>
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

          <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Reporter</label>
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
                <label className="form-label">Assignee</label>
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
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
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
              {subjectsList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

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

        <div className="form-group">
          <label className="form-label">Status</label>
          <select 
            className="form-control" 
            value={taskStatus} 
            onChange={e => setTaskStatus(e.target.value)} 
            required
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
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

        <button type="submit" className="btn-submit">
          Save Task
        </button>
      </form>
    </div>
  );
}
