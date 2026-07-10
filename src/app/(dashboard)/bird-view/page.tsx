'use client';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

import { useState, useEffect, useRef } from 'react';
import TaskEntryClient from '../task/TaskEntryClient';
import QueryEntryClient from '../query/QueryEntryClient';

interface Subject {
  id: number;
  name: string;
  code?: string;
}

interface Student {
  id: number;
  firstName: string;
  secondName: string;
  subjects: string[];
  className?: string;
}

export default function BirdViewPage() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Visual drag state
  const [draggedStudentIdx, setDraggedStudentIdx] = useState<number | null>(null);
  const [hoveredStudentIdx, setHoveredStudentIdx] = useState<number | null>(null);
  
  const [draggedSubjectIdx, setDraggedSubjectIdx] = useState<number | null>(null);
  const [hoveredSubjectIdx, setHoveredSubjectIdx] = useState<number | null>(null);
  
  const [clickedCellId, setClickedCellId] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'task' | 'query'>('task');
  const [currentDate, setCurrentDate] = useState('');

  // Custom dropdown states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentCategoryFilter, setStudentCategoryFilter] = useState<'All' | 'Olevels' | 'Matric' | 'Junior'>('All');
  const [cellData, setCellData] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newEntryModal, setNewEntryModal] = useState<{
    type: 'task' | 'query';
    subject: string;
    studentName: string;
    date: string;
  } | null>(null);

  const getStudentCategory = (className: string) => {
    if (!className) return 'Junior';
    const c = className.toUpperCase();
    if (c.includes('O1') || c.includes('O2') || c.includes('O3') || c.includes('O LEVEL') || c.includes('OLEVEL')) return 'Olevels';
    if (c.includes('F.S.C') || c.includes('FSC') || c.includes('MATRIC') || c.includes('9') || c.includes('10')) return 'Matric';
    return 'Junior';
  };
  
  const datePickerRef = useRef<HTMLDivElement>(null);
  const studentPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {}
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (studentPickerRef.current && !studentPickerRef.current.contains(event.target as Node)) {
        setIsStudentPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = selectedDate 
    ? selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : currentDate;

  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
    setSelectedDate(new Date());
    async function fetchData() {
      try {
        const initialDateStr = getLocalDateString(new Date());
        const response = await fetch(`/api/bird-view?date=${initialDateStr}&view=task`);
        if (response.ok) {
          const data = await response.json();
          let fetchedSubjects: Subject[] = data.subjects;
          let fetchedStudents: Student[] = data.students;

          const savedOrderStr = localStorage.getItem('birdViewOrder');
          if (savedOrderStr) {
            try {
              const savedOrder = JSON.parse(savedOrderStr);
              if (savedOrder.subjectIds) {
                fetchedSubjects = [...fetchedSubjects].sort((a, b) => {
                  const idxA = savedOrder.subjectIds.indexOf(a.id);
                  const idxB = savedOrder.subjectIds.indexOf(b.id);
                  if (idxA === -1 && idxB === -1) return 0;
                  if (idxA === -1) return 1;
                  if (idxB === -1) return -1;
                  return idxA - idxB;
                });
              }
              if (savedOrder.studentIds) {
                fetchedStudents = [...fetchedStudents].sort((a, b) => {
                  const idxA = savedOrder.studentIds.indexOf(a.id);
                  const idxB = savedOrder.studentIds.indexOf(b.id);
                  if (idxA === -1 && idxB === -1) return 0;
                  if (idxA === -1) return 1;
                  if (idxB === -1) return -1;
                  return idxA - idxB;
                });
              }
            } catch (e) {
              console.error('Failed to parse saved order', e);
            }
          }

          setSubjects(fetchedSubjects);
          setStudents(fetchedStudents);
          setSelectedStudentIds(fetchedStudents.map(s => s.id));
          if (data.cellData) setCellData(data.cellData);
        }
      } catch (error) {
        console.error('Failed to fetch bird view data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Fetch dynamic cell data on date or view change
  useEffect(() => {
    if (!selectedDate) return;
    
    async function fetchCellData() {
      try {
        const dateStr = getLocalDateString(selectedDate);
        const response = await fetch(`/api/bird-view?date=${dateStr}&view=${activeView}`);
        if (response.ok) {
          const data = await response.json();
          if (data.cellData) {
            setCellData(data.cellData);
          } else {
            setCellData([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cell data:', error);
      }
    }
    
    // Skip initial fetch since the first useEffect handles it
    if (selectedDate && getLocalDateString(selectedDate) === getLocalDateString(new Date()) && activeView === 'task' && refreshTrigger === 0) {
      // It might have already fetched, but let's just fetch it anyway to be safe, it's fast
    }
    fetchCellData();
  }, [selectedDate, activeView, refreshTrigger]);

  const saveOrder = (newSubjects: Subject[], newStudents: Student[]) => {
    const order = {
      subjectIds: newSubjects.map(s => s.id),
      studentIds: newStudents.map(s => s.id)
    };
    localStorage.setItem('birdViewOrder', JSON.stringify(order));
  };

  const setTransparentDragImage = (e: React.DragEvent) => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // ----- Student (Column) Drag Handlers -----
  const handleStudentDragStart = (e: React.DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    setDraggedStudentIdx(index);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      setTransparentDragImage(e);
    }
  };

  const handleStudentDragEnter = (e: React.DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    e.preventDefault();
    if (draggedStudentIdx === null) return;
    setHoveredStudentIdx(index);
  };

  const handleStudentDrop = (e: React.DragEvent<HTMLTableHeaderCellElement>, index: number) => {
    e.preventDefault();
    if (draggedStudentIdx === null || draggedStudentIdx === index) {
      setDraggedStudentIdx(null);
      setHoveredStudentIdx(null);
      return;
    }
    
    const newStudents = [...students];
    const draggedItem = newStudents[draggedStudentIdx];
    newStudents.splice(draggedStudentIdx, 1);
    newStudents.splice(index, 0, draggedItem);
    
    setStudents(newStudents);
    saveOrder(subjects, newStudents);
    setDraggedStudentIdx(null);
    setHoveredStudentIdx(null);
  };

  const handleStudentDragEnd = () => {
    setDraggedStudentIdx(null);
    setHoveredStudentIdx(null);
  };

  // ----- Subject (Row) Drag Handlers -----
  const handleSubjectDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedSubjectIdx(index);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      setTransparentDragImage(e);
    }
  };

  const handleSubjectDragEnter = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedSubjectIdx === null) return;
    setHoveredSubjectIdx(index);
  };

  const handleSubjectDrop = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedSubjectIdx === null || draggedSubjectIdx === index) {
      setDraggedSubjectIdx(null);
      setHoveredSubjectIdx(null);
      return;
    }
    
    const newSubjects = [...subjects];
    const draggedItem = newSubjects[draggedSubjectIdx];
    newSubjects.splice(draggedSubjectIdx, 1);
    newSubjects.splice(index, 0, draggedItem);
    
    setSubjects(newSubjects);
    saveOrder(newSubjects, students);
    setDraggedSubjectIdx(null);
    setHoveredSubjectIdx(null);
  };

  const handleSubjectDragEnd = () => {
    setDraggedSubjectIdx(null);
    setHoveredSubjectIdx(null);
  };

  return (
    <>
      <style jsx global>{`
        .dashboard-content {
          padding: 4px !important;
        }
        
        .dragged-column, .dragged-row {
          opacity: 0.4 !important;
          background-color: #f3f4f6 !important;
          transform: scale(0.98);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }

        .drop-target-left {
          border-left: 4px solid #14b8a6 !important; /* Teal 500 */
        }
        .drop-target-right {
          border-right: 4px solid #14b8a6 !important;
        }
        .drop-target-top {
          border-top: 4px solid #14b8a6 !important;
        }
        .drop-target-bottom {
          border-bottom: 4px solid #14b8a6 !important;
        }

        .unassigned-cell {
          background: repeating-linear-gradient(45deg, #f9fafb, #f9fafb 4px, #f3f4f6 4px, #f3f4f6 8px) !important;
        }
      `}</style>
      
      {/* Invisible overlay to close expanded cell when clicking anywhere else */}
      {clickedCellId && (
        <div 
          className="fixed inset-0 z-[50] cursor-default" 
          onClick={(e) => {
            e.stopPropagation();
            setClickedCellId(null);
          }}
        />
      )}

      {/* Custom Floating Column Overlay */}
      {draggedStudentIdx !== null && students[draggedStudentIdx] && (
        <div 
          className="fixed pointer-events-none z-[9999] opacity-95 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2),0_10px_10px_-5px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden border border-gray-300 transform -translate-x-1/2"
          style={{ left: mousePos.x + 'px', top: mousePos.y - 40 + 'px', width: '120px', height: 'max-content' }}
        >
          <table className="w-full text-sm text-left border-collapse bg-white">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-center border-b border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2 shadow-sm">
                      {students[draggedStudentIdx].firstName.charAt(0)}{students[draggedStudentIdx].secondName.charAt(0)}
                    </div>
                    <span className="truncate max-w-[100px]">
                      {students[draggedStudentIdx].firstName} {students[draggedStudentIdx].secondName}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, idx) => {
                const isAssigned = students[draggedStudentIdx].subjects.some(s => s.trim().toLowerCase() === subject.name.trim().toLowerCase());
                return (
                  <tr key={subject.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className={`px-4 py-3 text-center border-b border-gray-100 h-[100px] ${!isAssigned ? 'unassigned-cell' : 'bg-white'}`}>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Floating Row Overlay */}
      {draggedSubjectIdx !== null && subjects[draggedSubjectIdx] && (
        <div 
          className="fixed pointer-events-none z-[9999] opacity-95 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2),0_10px_10px_-5px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden border border-gray-300 transform -translate-y-1/2"
          style={{ left: mousePos.x - 100 + 'px', top: mousePos.y + 'px', width: 'max-content' }}
        >
          <table className="text-sm text-left border-collapse bg-white">
            <tbody>
              <tr>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 border-r border-gray-200 bg-gray-50 whitespace-nowrap min-w-[200px]">
                  {subjects[draggedSubjectIdx].name}
                </th>
                {students.map((student) => {
                  const isAssigned = student.subjects.includes(subjects[draggedSubjectIdx].name);
                  return (
                    <td 
                      key={student.id} 
                      className={`px-4 py-3 text-center border-r border-gray-100 min-w-[120px] h-[100px] ${!isAssigned ? 'unassigned-cell' : 'bg-white'}`}
                    >
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 35px Div element between top nav and table */}
      <div className="h-[35px] w-[calc(100%+4px)] ml-[-4px] mb-[4px] shadow-sm flex items-center px-8 space-x-3" style={{ backgroundColor: '#254245' }}>
        <button 
          onClick={() => setActiveView('task')}
          className={`h-[22px] px-6 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm ${activeView === 'task' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          style={{ backgroundColor: '#edab30' }}>
          Task
        </button>
        <button 
          onClick={() => setActiveView('query')}
          className={`h-[22px] px-6 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm ${activeView === 'query' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          style={{ backgroundColor: '#edab30' }}>
          Query
        </button>

        {/* Separator */}
        <div className="h-[22px] w-px bg-white/20 mx-2"></div>

        {/* Date and Students Buttons */}
        <div className="relative" ref={datePickerRef}>
          <button 
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className="h-[22px] px-4 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm opacity-100 hover:opacity-90 flex items-center space-x-2"
            style={{ backgroundColor: '#edab30' }}>
            <span>{formattedDate || '...'}</span>
            <i className={`fa-solid fa-chevron-${isDatePickerOpen ? 'up' : 'down'} text-[10px]`}></i>
          </button>
          
          {isDatePickerOpen && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] overflow-hidden">
               {/* Calendar Header */}
               <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-700">
                 <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-500"><i className="fa-solid fa-chevron-left"></i></button>
                 <span>
                   {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                 </span>
                 <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-500"><i className="fa-solid fa-chevron-right"></i></button>
               </div>
               {/* Calendar Grid */}
               <div className="p-3">
                 <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
                   {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                 </div>
                 <div className="grid grid-cols-7 gap-1 text-sm">
                   {blanksArray.map(b => <div key={`blank-${b}`} className="w-7 h-7"></div>)}
                   {daysArray.map(d => {
                     const isSelected = selectedDate && selectedDate.getDate() === d && selectedDate.getMonth() === calendarMonth.getMonth() && selectedDate.getFullYear() === calendarMonth.getFullYear();
                     return (
                       <button 
                         key={d} 
                         onClick={() => {
                           setSelectedDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d));
                           setIsDatePickerOpen(false);
                         }}
                         className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-[#edab30] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                       >
                         {d}
                       </button>
                     );
                   })}
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="relative" ref={studentPickerRef}>
          <button 
            onClick={() => setIsStudentPickerOpen(!isStudentPickerOpen)}
            className="h-[22px] px-4 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm opacity-100 hover:opacity-90 flex items-center space-x-2"
            style={{ backgroundColor: '#edab30' }}>
            <span>Students</span>
            <i className={`fa-solid fa-chevron-${isStudentPickerOpen ? 'up' : 'down'} text-[10px]`}></i>
          </button>

          {isStudentPickerOpen && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] max-h-[85vh] flex flex-col">
              
              {/* Category Tabs */}
              <div className="flex bg-gray-50 border-b border-gray-200 rounded-t overflow-hidden">
                {['All', 'Olevels', 'Matric', 'Junior'].map(cat => (
                  <button 
                     key={cat}
                     onClick={() => {
                       setStudentCategoryFilter(cat as any);
                       const newVisibleStudents = students.filter(s => cat === 'All' || getStudentCategory(s.className || '') === cat);
                       setSelectedStudentIds(newVisibleStudents.map(s => s.id));
                     }}
                     className={`flex-1 py-2 px-1 text-[9px] font-bold uppercase tracking-wider transition-colors border-r last:border-r-0 border-gray-200 ${studentCategoryFilter === cat ? 'bg-[#edab30] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="py-2 px-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Select Students</span>
                <button 
                  onClick={() => {
                    const visibleStudents = students.filter(s => studentCategoryFilter === 'All' || getStudentCategory(s.className || '') === studentCategoryFilter);
                    const allVisibleSelected = visibleStudents.length > 0 && visibleStudents.every(s => selectedStudentIds.includes(s.id));
                    if (allVisibleSelected) {
                      const visibleIds = visibleStudents.map(s => s.id);
                      setSelectedStudentIds(selectedStudentIds.filter(id => !visibleIds.includes(id)));
                    } else {
                      const newIds = new Set([...selectedStudentIds, ...visibleStudents.map(s => s.id)]);
                      setSelectedStudentIds(Array.from(newIds));
                    }
                  }}
                  className="text-[10px] text-[#254245] hover:underline font-bold uppercase tracking-wider"
                >
                  {students.length > 0 && students.filter(s => studentCategoryFilter === 'All' || getStudentCategory(s.className || '') === studentCategoryFilter).every(s => selectedStudentIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 p-1 space-y-0">
                {students.filter(s => studentCategoryFilter === 'All' || getStudentCategory(s.className || '') === studentCategoryFilter).map(student => (
                  <label key={student.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 cursor-pointer rounded transition-colors group border border-transparent hover:border-gray-100">
                    <div className="flex items-center space-x-3 overflow-hidden pr-2">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px]">
                        {student.firstName.charAt(0)}{student.secondName.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-[#254245] transition-colors truncate">
                        {student.firstName} {student.secondName}
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 border-gray-300 rounded cursor-pointer"
                      style={{ accentColor: '#edab30' }}
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, student.id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                        }
                      }}
                    />
                  </label>
                ))}
                {students.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">No students available</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-[calc(100%+4px)] ml-[-4px] h-full bg-white rounded-none shadow-sm border border-gray-100 border-t-4 border-t-teal-700 flex flex-col animate-fadeIn overflow-hidden">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading Grid Data...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table style={{ width: `${80 + (students.filter(s => selectedStudentIds.includes(s.id)).length * 120)}px` }} className="mx-0 mr-auto text-sm text-left border-separate border-spacing-0 table-fixed">
              <colgroup>
                <col style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }} />
                {students.map((student) => {
                  if (!selectedStudentIds.includes(student.id)) return null;
                  return <col key={student.id} style={{ width: '120px', minWidth: '120px', maxWidth: '120px' }} />;
                })}
              </colgroup>
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th scope="col" className="w-20 min-w-[5rem] max-w-[5rem] px-2 py-4 sticky left-0 bg-gray-100 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-r border-gray-200">
                  </th>
                  {students.map((student, index) => {
                    if (!selectedStudentIds.includes(student.id)) return null;
                    const isDragged = draggedStudentIdx === index;
                    const isHovered = hoveredStudentIdx === index && !isDragged;
                    // Determine drop indicator side
                    const showLeftIndicator = isHovered && draggedStudentIdx !== null && index < draggedStudentIdx;
                    const showRightIndicator = isHovered && draggedStudentIdx !== null && index > draggedStudentIdx;
                    
                    return (
                      <th 
                        key={student.id} 
                        scope="col" 
                        className="p-0 text-center border-b border-r border-gray-200 whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px]"
                      >
                        <div 
                          className={`w-full h-full px-4 py-4 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all group flex flex-col items-center relative
                            ${isDragged ? 'dragged-column' : ''}
                            ${showLeftIndicator ? 'drop-target-left' : ''}
                            ${showRightIndicator ? 'drop-target-right' : ''}
                          `}
                          draggable
                          onDragStart={(e) => handleStudentDragStart(e, index)}
                          onDragEnter={(e) => handleStudentDragEnter(e, index)}
                          onDragOver={(e) => { e.preventDefault(); handleDrag(e); }}
                          onDrag={(e) => handleDrag(e)}
                          onDrop={(e) => handleStudentDrop(e, index)}
                          onDragEnd={handleStudentDragEnd}
                        >
                          <div className={`flex flex-col items-center relative ${isDragged ? 'opacity-50' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2 shadow-sm">
                              {student.firstName.charAt(0)}{student.secondName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[100px]" title={`${student.firstName} ${student.secondName}`}>
                              {student.firstName} {student.secondName}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => {
                  const isDragged = draggedSubjectIdx === index;
                  const isHovered = hoveredSubjectIdx === index && !isDragged;
                  const showTopIndicator = isHovered && draggedSubjectIdx !== null && index < draggedSubjectIdx;
                  const showBottomIndicator = isHovered && draggedSubjectIdx !== null && index > draggedSubjectIdx;
                  
                  return (
                    <tr 
                      key={subject.id} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                        group
                      `}
                      onDragEnter={(e) => handleSubjectDragEnter(e, index)}
                      onDragOver={(e) => { e.preventDefault(); handleDrag(e); }}
                      onDrop={(e) => handleSubjectDrop(e, index)}
                    >
                      <th 
                        scope="row" 
                        className="w-20 min-w-[5rem] max-w-[5rem] p-0 font-medium text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-200 bg-inherit whitespace-nowrap align-middle h-[100px]"
                      >
                        <div 
                          className={`flex items-center justify-center w-full h-full px-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all
                            ${isDragged ? 'dragged-row' : ''}
                            ${showTopIndicator ? 'drop-target-top' : ''}
                            ${showBottomIndicator ? 'drop-target-bottom' : ''}
                          `}
                          draggable
                          onDragStart={(e) => handleSubjectDragStart(e, index)}
                          onDrag={(e) => handleDrag(e)}
                          onDragEnd={handleSubjectDragEnd}
                        >
                          <span className="text-center font-bold">{subject.code || subject.name}</span>
                        </div>
                      </th>
                      
                      {students.map((student, studentIndex) => {
                        if (!selectedStudentIds.includes(student.id)) return null;
                        const isAssigned = student.subjects.some(s => s.trim().toLowerCase() === subject.name.trim().toLowerCase());
                        const isStudentDragged = draggedStudentIdx === studentIndex;
                        const isStudentHovered = hoveredStudentIdx === studentIndex && !isStudentDragged;
                        const showLeftIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex < draggedStudentIdx;
                        const showRightIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex > draggedStudentIdx;
                        
                        const cellId = `${subject.id}-${student.id}`;
                        const isClicked = clickedCellId === cellId;
                        
                        return (
                          <td 
                            key={cellId} 
                            className="p-0 text-center border-b border-r border-gray-200 last:border-r-0 h-[100px] w-[120px] min-w-[120px] max-w-[120px]"
                          >
                            <div 
                              onClick={() => {
                                if (!isAssigned) return;
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                const items = cellData.filter(d => 
                                  (d.assignee === studentFullName || d.studentName === studentFullName) && 
                                  d.subject === subject.name
                                );
                                
                                if (items.length === 0) {
                                  setNewEntryModal({
                                    type: activeView,
                                    subject: subject.name,
                                    studentName: studentFullName,
                                    date: selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date())
                                  });
                                } else {
                                  setClickedCellId(isClicked ? null : cellId);
                                }
                              }}
                              className={`
                                w-full h-full transition-all duration-300 min-h-[100px] flex items-center justify-center p-1 overflow-hidden
                                ${!isAssigned && !isDragged && !isStudentDragged ? 'unassigned-cell' : 'bg-white'}
                                ${isAssigned ? 'cursor-pointer hover:bg-gray-50' : ''}
                                ${isClicked ? 'transform scale-[2] origin-center z-[60] shadow-[0_0_30px_rgba(0,0,0,0.3)] relative bg-white' : 'transform scale-100 z-0 relative'}
                                ${isDragged || isStudentDragged ? 'dragged-column dragged-row' : ''}
                                ${showLeftIndicator ? 'drop-target-left' : ''}
                                ${showRightIndicator ? 'drop-target-right' : ''}
                                ${showTopIndicator ? 'drop-target-top' : ''}
                                ${showBottomIndicator ? 'drop-target-bottom' : ''}
                              `}
                            >
                              {isAssigned && cellData && cellData.length > 0 && (() => {
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                const items = cellData.filter(d => 
                                  (d.assignee === studentFullName || d.studentName === studentFullName) && 
                                  d.subject === subject.name
                                );
                                
                                if (items.length === 0) return null;
                                
                                return (
                                  <div className="w-full h-full flex flex-col items-center justify-center space-y-1">
                                    {items.slice(0, 2).map((item, idx) => (
                                      <div key={idx} className="w-full bg-[#edab30]/10 border border-[#edab30]/30 rounded p-1 flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-[9px] font-bold text-[#254245] truncate w-full text-center uppercase">
                                          {activeView === 'task' ? item.taskType || 'Task' : 'Query'}
                                        </span>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${item.status === 'OPEN' || item.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                          {item.status}
                                        </span>
                                      </div>
                                    ))}
                                    {items.length > 2 && (
                                      <span className="text-[8px] font-bold text-gray-500 bg-gray-100 rounded px-1">+{items.length - 2} more</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={students.length + 1} className="px-6 py-8 text-center text-gray-500">
                      No subjects or students found to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {newEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl max-h-[95vh] bg-[#f9fafb] rounded-lg shadow-xl relative overflow-hidden" style={{ minHeight: '80vh' }}>
            {newEntryModal.type === 'task' ? (
              <TaskEntryClient 
                currentUser={currentUser} 
                initialValues={{ 
                  subject: newEntryModal.subject, 
                  assignee: newEntryModal.studentName,
                  dueDate: newEntryModal.date
                }} 
                onClose={() => setNewEntryModal(null)}
                onSuccess={() => {
                  setNewEntryModal(null);
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            ) : (
              <QueryEntryClient 
                currentUser={currentUser} 
                initialValues={{ 
                  subject: newEntryModal.subject, 
                  studentName: newEntryModal.studentName 
                }} 
                onClose={() => setNewEntryModal(null)}
                onSuccess={() => {
                  setNewEntryModal(null);
                  setRefreshTrigger(prev => prev + 1);
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
