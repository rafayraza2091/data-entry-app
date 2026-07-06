'use client';

import { useState, useEffect } from 'react';

type Tab = 'subjects' | 'schools' | 'books' | 'chapters' | 'topics' | 'entries';

export default function ViewDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('entries');
  
  const [data, setData] = useState({
    subjects: [] as any[],
    schools: [] as any[],
    books: [] as any[],
    chapters: [] as any[],
    topics: [] as any[],
    entries: [] as any[],
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        const [subjectsRes, schoolsRes, booksRes, chaptersRes, topicsRes, entriesRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/schools'),
          fetch('/api/books'),
          fetch('/api/chapters'),
          fetch('/api/topics'),
          fetch('/api/entries')
        ]);

        const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
        const schools = schoolsRes.ok ? await schoolsRes.json() : [];
        const books = booksRes.ok ? await booksRes.json() : [];
        const chapters = chaptersRes.ok ? await chaptersRes.json() : [];
        const topics = topicsRes.ok ? await topicsRes.json() : [];
        const entries = entriesRes.ok ? await entriesRes.json() : [];

        setData({ subjects, schools, books, chapters, topics, entries });
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAllData();
  }, []);

  const renderTable = () => {
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading data...</div>;
    }

    const currentData = data[activeTab];

    if (currentData.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No entries found for {activeTab}.</div>;
    }

    // Determine headers based on active tab
    let headers: string[] = [];
    let rowRenderer: (item: any, index: number) => React.ReactNode;

    switch (activeTab) {
      case 'subjects':
        headers = ['ID', 'Subject Name', 'Date Added'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.name}</td>
            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
          </tr>
        );
        break;
      case 'schools':
        headers = ['ID', 'School Name', 'Address', 'Branch', 'City', 'Date Added'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.name}</td>
            <td>{item.address}</td>
            <td>{item.branch}</td>
            <td>{item.city}</td>
            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
          </tr>
        );
        break;
      case 'books':
        headers = ['ID', 'Title', 'Subject', 'Edition', 'Publisher', 'School', 'Page No.'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.title}</td>
            <td>{item.subject}</td>
            <td>{item.edition}</td>
            <td>{item.publisher}</td>
            <td>{item.school}</td>
            <td>{item.page || '-'}</td>
          </tr>
        );
        break;
      case 'chapters':
        headers = ['ID', 'Subject', 'Book', 'Chapter No.', 'Chapter Title', 'Page No.'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.subject}</td>
            <td>{item.book}</td>
            <td>{item.chapterNumber}</td>
            <td>{item.chapterTitle}</td>
            <td>{item.page || '-'}</td>
          </tr>
        );
        break;
      case 'topics':
        headers = ['ID', 'Subject', 'Book', 'Chapter', 'Topic No.', 'Topic Name', 'Exercise', 'Page No.'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.subject}</td>
            <td>{item.book}</td>
            <td>{item.chapterName}</td>
            <td>{item.topicNumber}</td>
            <td>{item.topicName}</td>
            <td>{item.exercise || '-'}</td>
            <td>{item.page || '-'}</td>
          </tr>
        );
        break;
      case 'entries':
        headers = ['ID', 'School', 'Subject', 'Book', 'Edition', 'Class', 'Chapter No.', 'Chapter', 'Topic No.', 'Topic', 'Description', 'Page', 'Date', 'Time'];
        rowRenderer = (item, idx) => (
          <tr key={item.id}>
            <td>{idx + 1}</td>
            <td>{item.school}</td>
            <td>{item.subject}</td>
            <td>{item.book}</td>
            <td>{item.edition}</td>
            <td>{item.className}</td>
            <td>{item.chapter}</td>
            <td>{item.chapterName}</td>
            <td>{item.topicNumber}</td>
            <td>{item.topicName}</td>
            <td>{item.description}</td>
            <td>{item.page || '-'}</td>
            <td>{item.date}</td>
            <td>{item.time}</td>
          </tr>
        );
        break;
      default:
        return null;
    }

    return (
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {currentData.map(rowRenderer)}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="container mx-auto px-2 md:px-8 py-4 md:py-8" style={{ maxWidth: '100%' }}>

      
      <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-6 shadow-sm animate-slide-up w-full overflow-hidden">
        <div className="tabs-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'flex-start' }}>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'entries' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('entries')}>Syllabus</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'subjects' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('subjects')}>Subjects</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'schools' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('schools')}>Schools</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'books' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('books')}>Books</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'chapters' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('chapters')}>Chapters</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'topics' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setActiveTab('topics')}>Topics</button>
        </div>
        
        {renderTable()}
      </div>
    </main>
  );
}
