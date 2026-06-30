'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function BookEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: number; name: string; branch: string; city: string }[]>([]);
  
  usePersistentForm('book-entry-form');

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, schoolsRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/schools')
        ]);
        
        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data);
        }
        
        if (schoolsRes.ok) {
          const data = await schoolsRes.json();
          setSchools(data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

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
          <label className="form-label" htmlFor="className">Class</label>
          <select id="className" name="className" className="form-control" required defaultValue="">
            <option value="" disabled>Select a class...</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="O1">O1</option>
            <option value="O2">O2</option>
            <option value="O3">O3</option>
            <option value="9th metric">9th metric</option>
            <option value="10th metric">10th metric</option>
            <option value="FSC part 1">FSC part 1</option>
            <option value="FSC part 2">FSC part 2</option>
          </select>
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
        
        <div className="form-group">
          <label className="form-label" htmlFor="page">Page Number</label>
          <input type="number" id="page" name="page" className="form-control" placeholder="e.g. 500" min="1" required />
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
