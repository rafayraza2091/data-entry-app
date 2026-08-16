'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function TopicEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: number; title: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: number; chapterNumber: number; chapterTitle: string }[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState('');
  
  usePersistentForm('topic-entry-form');

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
        setSelectedBook('');
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

  // Fetch chapters when book changes
  useEffect(() => {
    async function fetchChaptersForBook() {
      if (!selectedBook) {
        setChapters([]);
        setSelectedChapterNumber('');
        return;
      }
      try {
        const response = await fetch(`/api/chapters?book=${encodeURIComponent(selectedBook)}`);
        if (response.ok) {
          const data = await response.json();
          setChapters(data);
        }
      } catch (error) {
        console.error('Failed to fetch chapters', error);
      }
    }
    fetchChaptersForBook();
  }, [selectedBook]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // We get chapterName by finding the chapter in our state, because the user could have submitted it,
    // but just to be safe, the chapterName select is bound to the same value or disabled.
    const selectedChapter = chapters.find(c => c.chapterNumber.toString() === selectedChapterNumber);
    if (!selectedChapter) {
      setStatus({ type: 'error', message: 'Please select a valid chapter.' });
      return;
    }
    
    const payload = {
      subject: data.subject,
      book: data.book,
      chapterNumber: selectedChapterNumber,
      chapterName: selectedChapter.chapterTitle,
      localTopicNumber: data.localTopicNumber,
      topicName: data.topicName,
      exercise: data.exercise,
      page: data.page
    };

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'Topic added successfully!' });
      
      // Keep selectedSubject, selectedBook, selectedChapter intact for fast entry of multiple topics
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while saving the topic.' });
    }
  };

  return (
    <form id="topic-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="subject">Subject</label>
          <select 
            id="subject" 
            name="subject" 
            className="form-control" 
            required 
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
            }}
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

        <div className="form-group">
          <label className="form-label" htmlFor="book">Book</label>
          <select 
            id="book" 
            name="book" 
            className="form-control" 
            required 
            value={selectedBook}
            onChange={(e) => {
              setSelectedBook(e.target.value);
            }}
            disabled={!selectedSubject || !selectedClass || books.length === 0}
          >
            <option value="" disabled>
              {selectedSubject && selectedClass && books.length === 0 ? 'No books found...' : 'Select a book...'}
            </option>
            {books.map((book) => (
              <option key={book.id} value={book.title}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="chapterNumber">Chapter Number</label>
          <select 
            id="chapterNumber" 
            className="form-control" 
            required 
            value={selectedChapterNumber}
            onChange={(e) => setSelectedChapterNumber(e.target.value)}
            disabled={!selectedBook || chapters.length === 0}
          >
            <option value="" disabled>
              {selectedBook && chapters.length === 0 ? 'No chapters found...' : 'Select chapter number...'}
            </option>
            {chapters.map((chapter) => (
              <option key={`num-${chapter.id}`} value={chapter.chapterNumber.toString()}>
                {chapter.chapterNumber}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="chapterName">Chapter Name</label>
          <select 
            id="chapterName" 
            className="form-control" 
            required 
            value={selectedChapterNumber}
            onChange={(e) => setSelectedChapterNumber(e.target.value)}
            disabled={!selectedBook || chapters.length === 0}
          >
            <option value="" disabled>
              {selectedBook && chapters.length === 0 ? 'No chapters found...' : 'Select chapter name...'}
            </option>
            {chapters.map((chapter) => (
              <option key={`name-${chapter.id}`} value={chapter.chapterNumber.toString()}>
                {chapter.chapterTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="localTopicNumber">Topic Number</label>
          <input 
            type="number" 
            id="localTopicNumber" 
            name="localTopicNumber" 
            className="form-control" 
            placeholder="e.g. 1 (saves as Chapter.1)" 
            min="1" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="topicName">Topic Name</label>
          <input 
            type="text" 
            id="topicName" 
            name="topicName" 
            className="form-control" 
            placeholder="e.g. Solving Equations" 
            required 
          />
        </div>
      </div>

      {selectedSubject.toLowerCase().includes('math') && (
        <div className="form-row">
          <div className="form-group" style={{ flex: '1 1 100%' }}>
            <label className="form-label" htmlFor="exercise">Exercise</label>
            <input 
              type="text" 
              id="exercise" 
              name="exercise" 
              className="form-control" 
              placeholder="e.g. Exercise 1A" 
            />
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group" style={{ flex: '1 1 100%' }}>
          <label className="form-label" htmlFor="page">Page Number</label>
          <input 
            type="number" 
            id="page" 
            name="page" 
            className="form-control" 
            placeholder="e.g. 10" 
            min="1" 
            required 
          />
        </div>
      </div>

      <div className="flex justify-start">
        <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Saving...' : 'Add Topic'}
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
