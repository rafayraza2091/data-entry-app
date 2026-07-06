'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function SubjectEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  usePersistentForm('subject-entry-form');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'Subject added successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while saving the subject.' });
    }
  };

  return (
    <form id="subject-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="name">Subject Name</label>
          <input type="text" id="name" name="name" className="form-control" placeholder="e.g. Mathematics" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="code">Subject Code</label>
          <input type="text" id="code" name="code" className="form-control" placeholder="e.g. MATH101" required />
        </div>
      </div>
      
      <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Saving...' : 'Add Subject'}
      </button>

      {status.message && status.type !== 'loading' && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
