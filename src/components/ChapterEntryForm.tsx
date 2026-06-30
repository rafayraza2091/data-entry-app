'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function ChapterEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: number; title: string; edition: number; publisher: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  usePersistentForm('chapter-entry-form');

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch subjects', error);
      }
    }
    fetchSubjects();
  }, []);

  // Fetch books when subject changes
  useEffect(() => {
    async function fetchBooksForSubject() {
      if (!selectedSubject) {
        setBooks([]);
        return;
      }
      try {
        const response = await fetch(`/api/books?subject=${encodeURIComponent(selectedSubject)}`);
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error('Failed to fetch books', error);
      }
    }
    fetchBooksForSubject();
  }, [selectedSubject]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'Chapter added successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while saving the chapter.' });
    }
  };

  return (
    <form id="chapter-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 className="form-title">Add a Chapter</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject</label>
          <select 
            id="subject" 
            name="subject" 
            className="form-control" 
            required 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="" disabled>Select a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="book">Book</label>
          <select 
            id="book" 
            name="book" 
            className="form-control" 
            required 
            defaultValue=""
            disabled={!selectedSubject || books.length === 0}
          >
            <option value="" disabled>
              {selectedSubject && books.length === 0 ? 'No books found for this subject...' : 'Select a book...'}
            </option>
            {books.map((book) => (
              <option key={book.id} value={book.title}>
                {book.title} (Edition {book.edition}) - {book.publisher}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="chapterNumber">Chapter Number</label>
          <input type="number" id="chapterNumber" name="chapterNumber" className="form-control" placeholder="e.g. 1" min="1" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="chapterTitle">Chapter Title</label>
          <input type="text" id="chapterTitle" name="chapterTitle" className="form-control" placeholder="e.g. Introduction to Algebra" required />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="page">Page Number</label>
          <input type="number" id="page" name="page" className="form-control" placeholder="e.g. 10" min="1" required />
        </div>
      </div>

      <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Saving...' : 'Add Chapter'}
      </button>

      {status.message && status.type !== 'loading' && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
