'use client';

import { useState } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function SchoolEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  
  usePersistentForm('school-entry-form');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'School added successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while saving the school.' });
    }
  };

  return (
    <form id="school-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="name">School Name</label>
          <input type="text" id="name" name="name" className="form-control" placeholder="e.g. Springfield High" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="code">School Code</label>
          <input type="text" id="code" name="code" className="form-control" placeholder="e.g. SPH-123" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="branch">Branch Name</label>
          <input type="text" id="branch" name="branch" className="form-control" placeholder="e.g. Main Campus" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="city">City Name</label>
          <input type="text" id="city" name="city" className="form-control" placeholder="e.g. Lahore" required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="address">School Address</label>
          <input type="text" id="address" name="address" className="form-control" placeholder="e.g. 123 Education Lane..." required />
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Saving...' : 'Add School'}
      </button>

      {status.message && status.type !== 'loading' && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
