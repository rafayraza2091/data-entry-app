'use client';

import { useState, useEffect } from 'react';

export default function QueryEntryClient({ currentUser }: { currentUser: any }) {
  const [user, setUser] = useState<any>(currentUser);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [book, setBook] = useState('');
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [exercise, setExercise] = useState('');
  const [questionNumber, setQuestionNumber] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [queryStatement, setQueryStatement] = useState('');
  const [queryStatus, setQueryStatus] = useState('open');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, subjRes, booksRes, topRes] = await Promise.all([
          fetch(`/api/task-users?t=${Date.now()}`),
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/topics')
        ]);
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          const formatName = (u: any) => `${u.firstName} ${u.lastName}`.trim();
          
          const tList = data.teachers?.map(formatName) || [];
          const aList = data.admins?.map(formatName) || [];
          const oList = data.owners?.map(formatName) || [];
          
          setTeachers([...tList, ...aList, ...oList]);
          setStudentsList(data.students || []);

          const defaultOwner = oList.length > 0 ? oList[0] : (aList.length > 0 ? aList[0] : '');
          setOwnerName(defaultOwner);
          
          if (currentUser) {
            const userName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
            if (currentUser.role === 'STUDENT') {
              setStudentName(userName);
              setTeacherName(defaultOwner);
            }
          }
        }
        
        if (subjRes.ok) setSubjectsList(await subjRes.json());
        if (booksRes.ok) setBooksList(await booksRes.json());
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
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          teacherName,
          className: derivedClassName,
          subject,
          book,
          chapter,
          topic,
          exercise,
          questionNumber,
          pageNumber,
          queryStatement,
          status: queryStatus
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit query');
      }

      setStatus({ type: 'success', message: 'Query submitted successfully!' });
      
      // Reset form fields
      setSubject('');
      setBook('');
      setChapter('');
      setTopic('');
      setExercise('');
      setQuestionNumber('');
      setPageNumber('');
      setQueryStatement('');
      setQueryStatus('open');
      setStatus({ type: 'success', message: 'Query submitted successfully!' });
      
      if (user.role !== 'STUDENT') {
        setStudentName('');
        setTeacherName('');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  if (!user) return <div style={{ padding: '2rem' }}>Please log in to view this page.</div>;
  if (loading) return <div style={{ padding: '2rem' }}>Loading user data...</div>;

  const isStudent = user.role === 'STUDENT';

  let derivedClassName = user.className || '';
  if (studentName) {
    const assignedStudent = studentsList.find(s => `${s.firstName} ${s.lastName}`.trim() === studentName);
    if (assignedStudent && assignedStudent.className) {
      derivedClassName = assignedStudent.className;
    }
  }

  const availableBooks = booksList.filter(b => 
    b.subject === subject && 
    (b.className || '').includes(derivedClassName)
  );
  
  const availableTopics = topicsList.filter(t => 
    t.subject === subject && 
    (book ? t.book === book : true)
  );
  
  const uniqueTopicNames = Array.from(new Set(availableTopics.map(t => t.topicName).filter(Boolean)));
  const availableExercises = topic ? Array.from(new Set(availableTopics.filter(t => t.topicName === topic).map(t => t.exercise).filter(Boolean))) : [];

  return (
    <div className="glass-panel animate-slide-up" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          <div className="form-group">
            <label className="form-label">Student Name</label>
            {isStudent ? (
              <input 
                type="text" 
                className="form-control" 
                value={studentName} 
                disabled 
                style={{ backgroundColor: 'var(--border-color)' }}
              />
            ) : (
              <select 
                className="form-control" 
                value={studentName} 
                onChange={e => setStudentName(e.target.value)} 
                required
              >
                <option value="" disabled>Select Student</option>
                {studentsList.map((s, i) => (
                  <option key={i} value={`${s.firstName} ${s.lastName}`.trim()}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            )}
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

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select 
              className="form-control" 
              value={subject} 
              onChange={e => {
                setSubject(e.target.value);
                setBook('');
                setTopic('');
              }} 
              required
            >
              <option value="" disabled>Select Subject</option>
              {subjectsList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields Section based on Subject */}
          <div className="form-group" style={{ gridColumn: '1 / span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Book</label>
              <select 
                className="form-control" 
                value={book} 
                onChange={e => {
                  setBook(e.target.value);
                  setTopic('');
                }} 
                disabled={!subject}
              >
                <option value="" disabled>Select Book (Optional)</option>
                {availableBooks.map((b: any) => (
                  <option key={b.id} value={b.title}>{b.title} Edition {b.edition}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Chapter</label>
              <input
                type="text"
                className="form-control"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Enter Chapter (Optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Topic</label>
              <select 
                className="form-control" 
                value={topic} 
                onChange={e => {
                  setTopic(e.target.value);
                  setExercise('');
                }} 
                disabled={!subject}
              >
                <option value="" disabled>Select Topic (Optional)</option>
                {uniqueTopicNames.map((tName, i) => (
                  <option key={i} value={tName as string}>{tName as string}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exercise</label>
              <select 
                className="form-control" 
                value={exercise} 
                onChange={e => setExercise(e.target.value)} 
                disabled={!topic || availableExercises.length === 0}
              >
                <option value="" disabled>Select Exercise (Optional)</option>
                {availableExercises.map((exName, i) => (
                  <option key={i} value={exName as string}>{exName as string}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={questionNumber} 
                onChange={e => setQuestionNumber(e.target.value)} 
                placeholder="e.g. Q4 (Optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Page Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={pageNumber} 
                onChange={e => setPageNumber(e.target.value)} 
                placeholder="e.g. 42 (Optional)"
              />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="form-label">Teacher</label>
            {isStudent ? (
              <input 
                type="text" 
                className="form-control" 
                value={teacherName} 
                disabled 
                style={{ backgroundColor: 'var(--border-color)' }}
              />
            ) : (
              <select 
                className="form-control" 
                value={teacherName} 
                onChange={e => setTeacherName(e.target.value)} 
                required
              >
                <option value="" disabled>Select Teacher</option>
                {teachers.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-control" 
              value={queryStatus} 
              onChange={e => setQueryStatus(e.target.value)} 
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / span 2' }}>
            <label className="form-label">Query</label>
            <textarea 
              className="form-control" 
              value={queryStatement} 
              onChange={e => setQueryStatement(e.target.value)} 
              rows={4}
              placeholder="Enter your query statement here..."
              required
              style={{ minHeight: '100px', height: 'auto', padding: '12px' }}
            />
          </div>

        </div>

        <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Submitting...' : 'Submit Query'}
        </button>

        {status.message && status.type !== 'loading' && (
          <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
