'use client';

import { useState, useEffect } from 'react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

export default function DataEntryForm() {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  
  // Data lists
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [books, setBooks] = useState<{ id: number; title: string; edition: number }[]>([]);
  const [chapters, setChapters] = useState<{ id: number; chapterNumber: number; chapterTitle: string }[]>([]);
  const [topics, setTopics] = useState<{ id: number; topicNumber: string; topicName: string; exercise: string | null; page: number | null }[]>([]);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  
  // Selected state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState('');
  const [selectedTopicNumber, setSelectedTopicNumber] = useState('');
  const [pageValue, setPageValue] = useState('');
  
  usePersistentForm('syllabus-entry-form');

  // Auto-populate page number when topic is selected
  useEffect(() => {
    if (selectedTopicNumber) {
      const topic = topics.find(t => t.topicNumber === selectedTopicNumber);
      if (topic && topic.page != null) {
        setPageValue(topic.page.toString());
      } else {
        setPageValue('');
      }
    }
  }, [selectedTopicNumber, topics]);

  // 1. Fetch Subjects
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

    async function fetchClasses() {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch classes', error);
      }
    }

    async function fetchSchools() {
      try {
        const response = await fetch('/api/schools');
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        }
      } catch (error) {
        console.error('Failed to fetch schools', error);
      }
    }

    fetchSubjects();
    fetchClasses();
    fetchSchools();
  }, []);

  // 2. Fetch Books
  useEffect(() => {
    async function fetchBooks() {
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
    fetchBooks();
  }, [selectedSubject, selectedClass]);

  // 3. Fetch Chapters
  useEffect(() => {
    async function fetchChapters() {
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
    fetchChapters();
  }, [selectedBook]);

  // 4. Fetch Topics
  useEffect(() => {
    async function fetchTopics() {
      if (!selectedBook || !selectedChapterNumber) {
        setTopics([]);
        setSelectedTopicNumber('');
        return;
      }
      try {
        const response = await fetch(`/api/topics?book=${encodeURIComponent(selectedBook)}&chapterNumber=${selectedChapterNumber}`);
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error('Failed to fetch topics', error);
      }
    }
    fetchTopics();
  }, [selectedBook, selectedChapterNumber]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting...' });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Find matching chapter & topic to ensure names are consistent if we want to submit them explicitly
    const selectedChapter = chapters.find(c => c.chapterNumber.toString() === selectedChapterNumber);
    const selectedTopic = topics.find(t => t.topicNumber === selectedTopicNumber);
    
    if (!selectedChapter || !selectedTopic) {
      setStatus({ type: 'error', message: 'Please select valid Chapter and Topic.' });
      return;
    }

    const payload = {
      school: data.school,
      subject: data.subject,
      book: data.book,
      className: data.className,
      edition: parseInt(data.edition as string, 10),
      chapter: selectedChapterNumber, // DB schema uses chapter as String
      chapterName: selectedChapter.chapterTitle,
      topicNumber: selectedTopicNumber,
      topicName: selectedTopic.topicName,
      description: data.description,
      exercise: data.exercise, // User selects from dropdown
      page: parseInt(data.page as string, 10),
    };

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to submit data');
      }
      
      setStatus({ type: 'success', message: 'Data entry successful!' });
      
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An error occurred while submitting.' });
    }
  };

  // Extract unique exercises from topics that match the selected topic number
  // Since our TopicEntry schema has a 1-to-1 with exercise per entry, there could be multiple entries with the same topic number if they added them?
  // Actually, there's only one topic selected.
  const selectedTopicData = topics.find(t => t.topicNumber === selectedTopicNumber);
  const exerciseOptions = selectedTopicData && selectedTopicData.exercise ? [selectedTopicData.exercise] : [];

  const editionOptions = Array.from(new Set(books.filter(b => b.title === selectedBook).map(b => b.edition)));

  return (
    <form id="syllabus-entry-form" onSubmit={handleSubmit} className="glass-panel animate-slide-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="school">School</label>
          <select 
            id="school" 
            name="school" 
            className="form-control" 
            required 
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="" disabled>Select a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.name}>{school.name}</option>
            ))}
          </select>
        </div>

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
              <option key={subject.id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>
        
      <div className="form-row">
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
            onChange={(e) => setSelectedBook(e.target.value)}
            disabled={!selectedSubject || !selectedClass || books.length === 0}
          >
            <option value="" disabled>
              {selectedSubject && selectedClass && books.length === 0 ? 'No books found...' : 'Select a book...'}
            </option>
            {books.map((book) => (
              <option key={book.id} value={book.title}>{book.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edition">Edition</label>
          <select 
            id="edition" 
            name="edition" 
            className="form-control" 
            required 
            disabled={!selectedBook || editionOptions.length === 0}
            defaultValue=""
          >
            <option value="" disabled>
              {selectedBook && editionOptions.length === 0 ? 'No editions found...' : 'Select an edition...'}
            </option>
            {editionOptions.map((ed, idx) => (
              <option key={idx} value={ed}>{ed}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="chapter">Chapter Number</label>
          <select 
            id="chapter" 
            name="chapter" 
            className="form-control" 
            required 
            value={selectedChapterNumber} 
            onChange={(e) => setSelectedChapterNumber(e.target.value)}
            disabled={!selectedBook || chapters.length === 0}
          >
            <option value="" disabled>
              {selectedBook && chapters.length === 0 ? 'No chapters found...' : 'Select a chapter...'}
            </option>
            {chapters.map(chapter => (
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
            name="chapterName" 
            className="form-control" 
            required 
            value={selectedChapterNumber} 
            onChange={(e) => setSelectedChapterNumber(e.target.value)}
            disabled={!selectedBook || chapters.length === 0}
          >
            <option value="" disabled>
              {selectedBook && chapters.length === 0 ? 'No chapters found...' : 'Select a chapter...'}
            </option>
            {chapters.map(chapter => (
              <option key={`name-${chapter.id}`} value={chapter.chapterNumber.toString()}>
                {chapter.chapterTitle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="topicNumber">Topic Number</label>
          <select 
            id="topicNumber" 
            name="topicNumber" 
            className="form-control" 
            required 
            value={selectedTopicNumber}
            onChange={(e) => setSelectedTopicNumber(e.target.value)}
            disabled={!selectedChapterNumber || topics.length === 0}
          >
            <option value="" disabled>
              {selectedChapterNumber && topics.length === 0 ? 'No topics found...' : 'Select a topic...'}
            </option>
            {topics.map(topic => (
              <option key={`num-${topic.id}`} value={topic.topicNumber}>
                {topic.topicNumber}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" htmlFor="topicName">Topic Name</label>
          <select 
            id="topicName" 
            name="topicName" 
            className="form-control" 
            required 
            value={selectedTopicNumber}
            onChange={(e) => setSelectedTopicNumber(e.target.value)}
            disabled={!selectedChapterNumber || topics.length === 0}
          >
            <option value="" disabled>
              {selectedChapterNumber && topics.length === 0 ? 'No topics found...' : 'Select a topic...'}
            </option>
            {topics.map(topic => (
              <option key={`name-${topic.id}`} value={topic.topicNumber}>
                {topic.topicName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        {selectedSubject === 'Mathematics' ? (
          <div className="form-group">
            <label className="form-label" htmlFor="exercise">Exercise</label>
            <select 
              id="exercise" 
              name="exercise" 
              className="form-control" 
              required 
              disabled={!selectedTopicNumber || exerciseOptions.length === 0}
              defaultValue=""
            >
              <option value="" disabled>
                {selectedTopicNumber && exerciseOptions.length === 0 ? 'No exercises found...' : 'Select an exercise...'}
              </option>
              {exerciseOptions.map((ex, idx) => (
                <option key={idx} value={ex}>{ex}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-group" style={{ display: 'none' }}>
            {/* Hidden exercise field for non-math subjects so the payload doesn't break if needed, though we can just omit it or pass empty */}
            <input type="hidden" name="exercise" value="" />
          </div>
        )}
        
        <div className={`form-group ${selectedSubject === 'Mathematics' ? '' : 'col-span-2'}`}>
          <label className="form-label" htmlFor="page">Page Number</label>
          <input 
            type="number" 
            id="page" 
            name="page" 
            className="form-control" 
            placeholder="e.g. 42" 
            min="1" 
            required 
            value={pageValue}
            readOnly
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-control" placeholder="Provide a brief explanation of the topic..." required></textarea>
      </div>

      <div className="flex justify-start">
        <button type="submit" className="btn-submit" disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Saving...' : 'Submit Entry'}
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
