'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function ChapterEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: number; title: string; edition: number; publisher: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  usePersistentForm('chapter-entry-form');

  // Fetch subjects and classes on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, classesRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/classes')
        ]);
        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data);
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

  // Fetch books when subject or class changes
  useEffect(() => {
    async function fetchBooksForSubject() {
      if (!selectedSubject || !selectedClass) {
        setBooks([]);
        return;
      }
      try {
        const response = await fetch(`/api/books?subject=${encodeURIComponent(selectedSubject)}&className=${encodeURIComponent(selectedClass)}`);
        if (response.ok) {
          const data = await response.json();
          setBooks(data);
        }
      } catch (error) {
        console.error('Failed to fetch books', error);
      }
    }
    fetchBooksForSubject();
  }, [selectedSubject, selectedClass]);

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
          <label className="form-label" htmlFor="className">Class</label>
          <select 
            id="className" 
            name="className" 
            className="form-control" 
            required 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="" disabled>Select a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group col-span-2">
          <label className="form-label" htmlFor="book">Book</label>
          <select 
            id="book" 
            name="book" 
            className="form-control" 
            required 
            defaultValue=""
            disabled={!selectedSubject || !selectedClass || books.length === 0}
          >
            <option value="" disabled>
              {selectedSubject && selectedClass && books.length === 0 ? 'No books found...' : 'Select a book...'}
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

      <div className="flex justify-start">
        <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Saving...' : 'Add Chapter'}
        </button>
      </div>

      {status.message && status.type !== 'loading' && (
        <div className={`status-message ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
          {status.message}
        </div>
      )}
    </form>
  );
}
