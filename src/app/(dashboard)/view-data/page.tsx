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
    <main className="w-auto pb-8 pt-2 px-4 sm:px-6" style={{ maxWidth: 'none' }}>

      <div className="py-2.5 px-4 rounded-[4px] mb-4 bg-[#172238] border border-[#D8D2C5]/20 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <h2 className="text-sm font-semibold text-white hidden md:block whitespace-nowrap tracking-wide">Data Management</h2>
          
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#687286]">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <input 
              type="text" 
              placeholder="Global search across all fields..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-[32px] border border-[#D8D2C5]/40 rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#2463EB] text-xs bg-white text-[#172238]"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`flex-1 md:flex-none h-[32px] flex items-center justify-center gap-2 px-3 border rounded-[3px] text-xs font-semibold transition-colors whitespace-nowrap ${
                isFiltersExpanded || activeFilterCount > 0 
                  ? 'bg-[#124D45] border-[#B48632] text-white' 
                  : 'bg-[#FFFEFA] border-[#D8D2C5] text-[#172238] hover:bg-[#F4F1E9]'
              }`}
            >
              <i className="fa-solid fa-filter text-[11px]"></i>
              <span>Filters</span>
              {activeFilterCount > 0 && <span className="bg-[#B48632] text-white rounded-full px-1.5 py-0.2 text-[10px] ml-0.5">{activeFilterCount}</span>}
            </button>
            
            {(activeFilterCount > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="h-[32px] flex items-center justify-center px-3 border border-[#D8D2C5] bg-[#FFFEFA] text-[#172238] hover:bg-[#F4F1E9] rounded-[3px] text-xs font-semibold transition-colors whitespace-nowrap"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {isFiltersExpanded && (
          <div className="mt-3 p-3 bg-[#FFFEFA] rounded-[3px] border border-[#D8D2C5] animate-in fade-in duration-120">
            <h3 className="text-[10px] font-semibold text-[#687286] uppercase tracking-wider mb-2">Advanced Date Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#687286] mb-1">From Date</label>
                <input 
                  type="datetime-local"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                  className="w-full h-[32px] px-2.5 border border-[#D8D2C5] rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#2463EB] text-xs bg-white text-[#172238]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#687286] mb-1">To Date</label>
                <input 
                  type="datetime-local"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                  className="w-full h-[32px] px-2.5 border border-[#D8D2C5] rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#2463EB] text-xs bg-white text-[#172238]"
                />
              </div>
            </div>
          </div>
        )}

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">Active Filters:</span>
            {filterStartDate && (
              <span className="inline-flex items-center bg-[#124D45] text-white text-[11px] px-2 py-0.5 rounded-[2px] border border-[#B48632]">
                <span className="opacity-80 mr-1">From:</span> {filterStartDate.replace('T', ' ')}
                <button onClick={() => setFilterStartDate('')} className="hover:text-[#B48632] ml-1.5 focus:outline-none" aria-label="Remove From Date filter">
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}
            {filterEndDate && (
              <span className="inline-flex items-center bg-[#124D45] text-white text-[11px] px-2 py-0.5 rounded-[2px] border border-[#B48632]">
                <span className="opacity-80 mr-1">To:</span> {filterEndDate.replace('T', ' ')}
                <button onClick={() => setFilterEndDate('')} className="hover:text-[#B48632] ml-1.5 focus:outline-none" aria-label="Remove To Date filter">
                  <i className="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </span>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs text-[#B48632] hover:underline ml-2 transition-colors focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#FFFEFA] rounded-[4px] border border-[#D8D2C5] overflow-x-auto shadow-xs p-4">
        <div className="tabs-container mb-4 flex flex-wrap gap-1.5">
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'entries' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('entries'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Syllabus</button>
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'subjects' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('subjects'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Subjects</button>
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'schools' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('schools'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Schools</button>
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'books' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('books'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Books</button>
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'chapters' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('chapters'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Chapters</button>
          <button className={`h-[32px] px-3.5 text-xs font-semibold rounded-[3px] transition-colors ${activeTab === 'topics' ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#F4F1E9] border border-[#D8D2C5] text-[#687286] hover:bg-[#ECE7DC] hover:text-[#172238]'}`} onClick={() => {setActiveTab('topics'); setSearchQuery(''); setFilterStartDate(''); setFilterEndDate('');}}>Topics</button>
        </div>
        {renderTable()}
      </div>
    </main>
  );
}
