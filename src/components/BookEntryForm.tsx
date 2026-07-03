'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function BookEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: number; name: string; branch: string; city: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  usePersistentForm('book-entry-form');

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, schoolsRes, classesRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/schools'),
          fetch('/api/classes')
        ]);
        
        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data);
        }
        
        if (schoolsRes.ok) {
          const data = await schoolsRes.json();
          setSchools(data);
        }
        
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one class.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.className = selectedClasses.join(', ');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'Book entry successful!' });
      setSelectedClasses([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while submitting.' });
    }
  };

  return (
    <form id="book-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="form-title">Book Entry</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="title">Book Title</label>
          <input type="text" id="title" name="title" className="form-control" placeholder="e.g. Advanced Calculus" required />
        </div>

        <div className="form-group">
          <label className="form-label">Classes</label>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexDirection: 'row' }}>
            <select 
              className="form-control" 
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedClasses.includes(val)) {
                  setSelectedClasses([...selectedClasses, val]);
                }
                e.target.value = ""; // Reset after selection
              }}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="" disabled>Select a class...</option>
              {classes.filter(c => !selectedClasses.includes(c.name)).map((cls) => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
            
            <div style={{ flex: '2', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '42px', alignItems: 'center', padding: '0.25rem' }}>
              {selectedClasses.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>No classes selected...</span>}
              {selectedClasses.map(cls => (
                <div 
                  key={cls}
                  className="class-badge"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.35rem 0.75rem',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    position: 'relative',
                    cursor: 'default',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                    if(btn) btn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                    if(btn) btn.style.opacity = '0';
                  }}
                >
                  {cls}
                  <button 
                    type="button"
                    className="delete-btn"
                    onClick={() => setSelectedClasses(selectedClasses.filter(c => c !== cls))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: '6px',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      lineHeight: 1
                    }}
                    title="Remove class"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject</label>
          <select id="subject" name="subject" className="form-control" required defaultValue="">
            <option value="" disabled>Select a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edition">Edition</label>
          <input type="number" id="edition" name="edition" className="form-control" placeholder="e.g. 5" min="1" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="publisher">Publisher</label>
          <input type="text" id="publisher" name="publisher" className="form-control" placeholder="e.g. Oxford University Press" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="school">School</label>
          <select id="school" name="school" className="form-control" required defaultValue="">
            <option value="" disabled>Select a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={`${school.name} - ${school.branch} (${school.city})`}>
                {school.name} - {school.branch} ({school.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Saving...' : 'Submit Entry'}
      </button>

      {status.message && status.type !== 'loading' && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
