'use client';

import { useState, useEffect } from 'react';
import ImageCropper from '@/components/ImageCropper';

export default function QueryEntryClient({ 
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
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Form State
  const [studentName, setStudentName] = useState(initialValues?.studentName || '');
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState(initialValues?.subject || '');
  const [book, setBook] = useState('');
  const [topic, setTopic] = useState('');
  const [chapter, setChapter] = useState('');
  const [exercise, setExercise] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [queryStatement, setQueryStatement] = useState('');
  const [queryStatus, setQueryStatus] = useState('open');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [ownerName, setOwnerName] = useState('');

  // Image Upload State
  const [croppedImages, setCroppedImages] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);

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
          
          setTeachers(Array.from(new Set([...tList, ...aList, ...oList])));
          setStudentsList(data.students || []);

          const defaultOwner = oList.length > 0 ? oList[0] : (aList.length > 0 ? aList[0] : '');
          setOwnerName(defaultOwner);
          
          if (currentUser) {
            const userName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
            if (currentUser.role === 'STUDENT') {
              setStudentName(userName);
              setTeacherName(defaultOwner);
            } else if (currentUser.role === 'OWNER' || currentUser.role === 'TEACHER' || currentUser.role === 'COORDINATOR' || currentUser.role === 'ASSISTANT') {
              setTeacherName(userName);
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
    setStatus({ type: 'loading', message: 'Uploading and submitting...' });

    try {
      let imageUrls: string[] = [];
      if (croppedImages.length > 0) {
        const formData = new FormData();
        croppedImages.forEach(blob => {
          formData.append('images', blob, 'cropped.jpg');
        });
        formData.append('schoolName', derivedSchoolName);
        formData.append('className', derivedClassName);
        formData.append('studentName', studentName);

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

      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          teacherName,
          className: derivedClassName,
          schoolName: derivedSchoolName,
          subject,
          book,
          chapter,
          topic,
          exercise,
          pageNumber,
          queryStatement,
          status: queryStatus,
          images: imageUrls,
          createdBy: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown',
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
      setPageNumber('');
      setQueryStatement('');
      setQueryStatus('open');
      setCroppedImages([]);
      
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
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
  let derivedSchoolName = user.schoolName || '';
  if (studentName) {
    const assignedStudent = studentsList.find(s => `${s.firstName} ${s.lastName}`.trim() === studentName);
    if (assignedStudent && assignedStudent.className) {
      derivedClassName = assignedStudent.className;
    }
    if (assignedStudent && assignedStudent.schoolName) {
      derivedSchoolName = assignedStudent.schoolName;
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
    <div className="glass-panel animate-slide-up mx-auto max-w-4xl mt-4 md:mt-8 p-4 md:p-8" style={{ position: 'relative', maxHeight: onClose ? '90vh' : 'auto', overflowY: onClose ? 'auto' : 'visible' }}>
      {onClose && (
        <button 
          onClick={onClose}
          type="button"
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', zIndex: 10, color: '#6b7280' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}

      {status.message && (
        <div className={`p-4 mb-4 rounded ${status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          
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
            <label className="form-label">Page Number</label>
            <input 
              type="text" 
              className="form-control" 
              value={pageNumber} 
              onChange={e => setPageNumber(e.target.value)} 
              placeholder="e.g. 42 (Optional)"
            />
          </div>

          <div className="form-group">
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

          <div className="form-group col-span-2">
            <label className="form-label">Query</label>
            <textarea 
              className="form-control" 
              value={queryStatement} 
              onChange={e => setQueryStatement(e.target.value)} 
              rows={2}
              placeholder="Enter your query statement here..."
              required
              style={{ padding: '12px', resize: 'vertical' }}
            />
          </div>

          {/* Attachments Section */}
          <div className="form-group col-span-2">
            <label className="form-label">Attachments (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setIsCropping(true);
                  e.target.value = ''; // Reset input so same file can be selected again
                }
              }} 
              className="form-control" 
              style={{ padding: '8px' }}
            />
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
                      onClick={() => setCroppedImages(prev => prev.filter((_, i) => i !== idx))}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', lineHeight: 1 }}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
