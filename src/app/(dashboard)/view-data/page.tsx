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
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const activeFilterCount = (filterStartDate ? 1 : 0) + (filterEndDate ? 1 : 0);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchQuery('');
  };
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

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

    const filteredData = currentData.filter(item => {
      const matchesSearch = !searchQuery || Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      let matchesDate = true;
      if (filterStartDate || filterEndDate) {
        const rawDate = item.date || item.createdAt;
        if (rawDate) {
           try {
             const dTime = new Date(rawDate).getTime();
             
             if (filterStartDate) {
               const start = new Date(filterStartDate).getTime();
               if (dTime < start) matchesDate = false;
             }
             if (filterEndDate) {
               const end = new Date(filterEndDate).getTime();
               if (dTime > end) matchesDate = false;
             }
           } catch (e) {
             matchesDate = false;
           }
        } else {
           matchesDate = false;
        }
      }
      return matchesSearch && matchesDate;
    });

    if (currentData.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No entries found for {activeTab}.</div>;
    }
    
    if (filteredData.length === 0) {
      return <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No entries match your search.</div>;
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
            {filteredData.map(rowRenderer)}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main className="w-auto pb-8 -mt-4 md:-mt-8 -mx-4 md:-mx-8" style={{ maxWidth: 'none' }}>

      <div className="py-2 px-4 md:px-8 mb-4" style={{ backgroundColor: '#0f766e' }}>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <h2 className="text-lg font-bold text-white hidden md:block whitespace-nowrap">Data Management</h2>
          
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Global search across all fields..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-shadow"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 border rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isFiltersExpanded || activeFilterCount > 0 
                  ? 'bg-teal-50 border-teal-200 text-teal-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters {activeFilterCount > 0 && <span className="bg-teal-500 text-white rounded-full px-2 py-0.5 text-xs ml-1">{activeFilterCount}</span>}
            </button>
            
            {(activeFilterCount > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isFiltersExpanded && (
          <div className="mt-4 p-4 bg-teal-50/50 rounded-md border border-teal-100 animate-slide-up">
            <h3 className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-teal-700/70 mb-1">From Date</label>
                <input 
                  type="datetime-local"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/70 mb-1">To Date</label>
                <input 
                  type="datetime-local"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 animate-fade-in">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-1">Active Filters:</span>
            {filterStartDate && (
              <span className="inline-flex items-center bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full border border-teal-200">
                <span className="opacity-70">From:</span> {filterStartDate.replace('T', ' ')}
                <button onClick={() => setFilterStartDate('')} className="hover:bg-teal-200 hover:text-teal-900 rounded-full p-0.5 ml-1 transition-colors focus:outline-none" aria-label={`Remove From Date filter`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            )}
            {filterEndDate && (
              <span className="inline-flex items-center bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full border border-teal-200">
                <span className="opacity-70">To:</span> {filterEndDate.replace('T', ' ')}
                <button onClick={() => setFilterEndDate('')} className="hover:bg-teal-200 hover:text-teal-900 rounded-full p-0.5 ml-1 transition-colors focus:outline-none" aria-label={`Remove To Date filter`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-800 underline ml-2 transition-colors focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mx-4 md:mx-8">
        <div className="tabs-container mb-4 pt-4 px-4 md:px-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'flex-start' }}>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'entries' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('entries'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Syllabus</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'subjects' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('subjects'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Subjects</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'schools' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('schools'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Schools</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'books' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('books'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Books</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'chapters' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('chapters'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Chapters</button>
          <button className={`px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm rounded-md font-medium transition-colors ${activeTab === 'topics' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => {setActiveTab('topics'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Topics</button>
        </div>
        {renderTable()}
      </div>
    </main>
  );
}
