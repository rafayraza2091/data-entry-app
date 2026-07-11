'use client';

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getVibrantColor = (str: string) => {
  // Kelly's 22 colors of maximum contrast (filtered for white text legibility) + robust additions
  const colors = [
    '#e6194b', // Vivid Red
    '#3cb44b', // Green
    '#4363d8', // Blue
    '#f58231', // Orange
    '#911eb4', // Purple
    '#f032e6', // Magenta
    '#469990', // Teal
    '#9a6324', // Brown
    '#800000', // Maroon
    '#808000', // Olive
    '#000075', // Navy
    '#D81B60', // Pink/Rose
    '#3949AB', // Indigo
    '#2E7D32', // Forest
    '#D84315', // Rust/Brick
    '#00838F'  // Dark Cyan
  ];
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return colors[Math.abs(hash) % colors.length];
};

const getTaskTypeBadge = (typeStr: string) => {
  if (!typeStr) return { initials: 'TK', color: '#474E30' };
  const type = typeStr.toUpperCase();
  if (type.includes('TUITION')) return { initials: 'TW', color: '#BB8130' }; // Yellow-ochre
  if (type.includes('CLASS')) return { initials: 'CW', color: '#AB6422' }; // Tan/ochre
  if (type.includes('HOME')) return { initials: 'HW', color: '#474E30' }; // Olive green
  if (type.includes('TEST')) return { initials: 'T', color: '#5B1F0F' }; // Brown/Rust
  if (type.includes('PROJECT')) return { initials: 'P', color: '#2F3C29' }; // Forest green
  return { initials: type.slice(0, 2).toUpperCase() || 'TK', color: '#474E30' };
};

const getStatusColor = (statusStr: string) => {
  if (!statusStr) return '#64748b'; // Dark grey
  const status = statusStr.toUpperCase();
  if (status.includes('PROGRESS')) return '#007AFF'; // Vibrant Blue
  if (status === 'DONE' || status === 'COMPLETED') return '#237f5d'; // Done
  if (status === 'PENDING') return '#f0be39'; // Pending
  if (status === 'OPEN') return '#64748b'; // Dark grey
  return '#64748b'; // Default dark grey
};

const getStatusInitials = (statusStr: string) => {
  if (!statusStr) return 'O';
  const status = statusStr.toUpperCase();
  if (status.includes('PROGRESS')) return 'IP';
  if (status === 'DONE' || status === 'COMPLETED') return 'D';
  if (status === 'PENDING') return 'P';
  if (status === 'OPEN') return 'O';
  return 'O';
};

import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [highlightedStudentId, setHighlightedStudentId] = useState<number | null>(null);
  const [highlightedSubjectId, setHighlightedSubjectId] = useState<number | null>(null);

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
  const [viewMode, setViewMode] = useState<'grid' | 'stacked'>('grid');

  const [boardFilters, setBoardFilters] = useState({
    status: '',
    taskType: '',
    assignee: '',
    reporter: ''
  });
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [draggedTaskSource, setDraggedTaskSource] = useState<any | null>(null);
  const [clonedCells, setClonedCells] = useState<Set<string>>(new Set());

  // Deletion States
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [pendingDeletions, setPendingDeletions] = useState<number[]>([]);
  const [toastConfig, setToastConfig] = useState<{ visible: boolean; taskId: number | null }>({ visible: false, taskId: null });
  const deleteTimeoutsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newEntryModal, setNewEntryModal] = useState<{
    type: 'task' | 'query';
    subject: string;
    studentName: string;
    date: string;
  } | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);

  const handleUpdateTaskField = async (taskId: number, fieldName: string, newValue: string) => {
    // Optimistic UI update
    setCellData(prev => prev.map(d => d.id === taskId ? { ...d, [fieldName]: newValue } : d));
    setActiveDropdown(null);

    try {
      const endpoint = activeView === 'task' ? '/api/tasks' : '/api/queries';
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, fieldName, newValue })
      });
      if (!res.ok) {
        console.error('Failed to update task');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchUpdate = async (fieldName: string, newValue: string) => {
    setCellData(prev => prev.map(d => selectedTaskIds.includes(d.id) ? { ...d, [fieldName]: newValue } : d));
    const promises = selectedTaskIds.map(taskId => 
      fetch(activeView === 'task' ? '/api/tasks' : '/api/queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, fieldName, newValue })
      })
    );
    try {
      await Promise.all(promises);
      setSelectedTaskIds([]);
      setIsBatchMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloneTask = async (task: any, newAssignee: string) => {
    // Generate a temporary ID for optimistic UI
    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const newTask = {
      ...task,
      id: tempId,
      assignee: newAssignee,
    };
    
    // Optimistic update
    setCellData(prev => [...prev, newTask]);

    try {
      const endpoint = activeView === 'task' ? '/api/tasks' : '/api/queries';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          assignee: newAssignee,
        })
      });
      if (res.ok) {
        const createdTask = await res.json();
        // Replace temp ID with real ID
        setCellData(prev => prev.map(t => t.id === tempId ? createdTask : t));
      } else {
        // Revert on error
        setCellData(prev => prev.filter(t => t.id !== tempId));
      }
    } catch (err) {
      console.error('Failed to clone task', err);
      setCellData(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleStackedDrop = (e: React.DragEvent, studentFullName: string) => {
    if (draggedTaskId !== null) {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.altKey || e.shiftKey || e.metaKey) {
        if (draggedTaskSource) {
          handleCloneTask(draggedTaskSource, studentFullName);
        }
      } else {
        handleUpdateTaskField(draggedTaskId, 'assignee', studentFullName);
      }
      
      setDraggedTaskId(null);
      setDraggedTaskSource(null);
      setClonedCells(new Set());
    }
  };

  const handleDeleteInitiate = (taskId: number) => {
    setTaskToDelete(taskId);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete === null) return;
    const taskId = taskToDelete;
    
    // Optimistically hide from UI
    setPendingDeletions(prev => [...prev, taskId]);
    setTaskToDelete(null);
    setToastConfig({ visible: true, taskId });

    // Start 7-second countdown before actual deletion
    const timeoutId = setTimeout(async () => {
      try {
        const endpoint = activeView === 'task' ? '/api/tasks' : '/api/queries';
        await fetch(`${endpoint}?id=${taskId}`, { method: 'DELETE' });
        
        // Remove from UI state completely
        setCellData(prev => prev.filter(t => t.id !== taskId));
        setPendingDeletions(prev => prev.filter(id => id !== taskId));
        setToastConfig(prev => (prev.taskId === taskId ? { visible: false, taskId: null } : prev));
      } catch (err) {
        console.error('Failed to delete task', err);
        // Revert on error
        setPendingDeletions(prev => prev.filter(id => id !== taskId));
      }
      
      delete deleteTimeoutsRef.current[taskId];
    }, 7000);

    deleteTimeoutsRef.current[taskId] = timeoutId;
  };

  const handleUndoDelete = () => {
    if (toastConfig.taskId === null) return;
    const taskId = toastConfig.taskId;
    
    // Cancel the timeout
    if (deleteTimeoutsRef.current[taskId]) {
      clearTimeout(deleteTimeoutsRef.current[taskId]);
      delete deleteTimeoutsRef.current[taskId];
    }
    
    // Revert optimistic hide
    setPendingDeletions(prev => prev.filter(id => id !== taskId));
    setToastConfig({ visible: false, taskId: null });
  };

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (activeDropdown !== null) {
          setActiveDropdown(null);
        } else if (newEntryModal !== null || clickedCellId !== null || isDatePickerOpen || isStudentPickerOpen) {
          // If a modal, floating cell, or dropdown is open, close only them
          setNewEntryModal(null);
          setClickedCellId(null);
          setIsDatePickerOpen(false);
          setIsStudentPickerOpen(false);
        } else {
          // Otherwise, turn off the row/column highlighting
          setHighlightedStudentId(null);
          setHighlightedSubjectId(null);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newEntryModal, clickedCellId, isDatePickerOpen, isStudentPickerOpen, activeDropdown]);

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
        
        const [response, chapRes, topRes] = await Promise.all([
          fetch(`/api/bird-view?date=${initialDateStr}&view=task`),
          fetch('/api/chapters'),
          fetch('/api/topics')
        ]);
        
        if (chapRes.ok) setChaptersList(await chapRes.json());
        if (topRes.ok) setTopicsList(await topRes.json());

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
        const dateToUse = selectedDate || new Date();
        const dateStr = getLocalDateString(dateToUse);
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

  const filteredCellData = cellData.filter(item => {
    if (pendingDeletions.includes(item.id)) return false;
    
    if (boardFilters.status && boardFilters.status !== 'All') {
      if (boardFilters.status === 'IN_PROGRESS' && !item.status?.toUpperCase().includes('PROGRESS')) return false;
      else if (boardFilters.status !== 'IN_PROGRESS' && item.status?.toUpperCase() !== boardFilters.status) return false;
    }
    if (boardFilters.taskType && boardFilters.taskType !== 'All' && item.taskType !== boardFilters.taskType) return false;
    if (boardFilters.assignee && boardFilters.assignee !== 'All' && item.assignee !== boardFilters.assignee) return false;
    if (boardFilters.reporter && boardFilters.reporter !== 'All' && item.reporter !== boardFilters.reporter) return false;
    return true;
  });

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

  const tasksPerStudent = useMemo(() => {
    return students.map(student => {
      const studentFullName = `${student.firstName} ${student.secondName}`.trim();
      const studentTasks = filteredCellData.filter(t => t.assignee === studentFullName || t.studentName === studentFullName);
      const statusOrder = ['IN_PROGRESS', 'OPEN', 'PENDING', 'DONE'];
      studentTasks.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
      return { studentId: student.id, tasks: studentTasks };
    });
  }, [students, filteredCellData]);

  const maxTasks = Math.max(...tasksPerStudent.map(s => s.tasks.length), 0);
  const stackedRowCount = Math.max(maxTasks + 1, 1);

  const tableRows = viewMode === 'grid' 
    ? subjects.map((subject, index) => ({ type: 'grid', id: subject.id, index, subject }))
    : Array.from({ length: stackedRowCount }).map((_, index) => ({ type: 'stacked', id: `stacked-${index}`, index, subject: null }));

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
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold mb-2 shadow-sm" style={{ backgroundColor: getVibrantColor(students[draggedStudentIdx].firstName + ' ' + students[draggedStudentIdx].secondName) }}>
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
                      className={`px-4 py-3 text-center border-r border-gray-100 min-w-[120px] w-[120px] h-[100px] ${!isAssigned ? 'unassigned-cell' : 'bg-white'}`}
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
      <div className="h-[35px] w-full mb-[4px] shadow-sm flex items-center px-8 space-x-3" style={{ backgroundColor: '#254245' }}>
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
        <div className="h-[22px] w-px bg-white/20 mx-2 hidden md:block"></div>

        {/* View Mode Toggle */}
        <div className="flex items-center mr-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`h-[22px] px-3 text-[10px] font-bold uppercase tracking-wider text-white transition-all shadow-sm rounded-l border border-r-0 border-transparent ${viewMode === 'grid' ? 'bg-[#edab30] opacity-100' : 'bg-[#254245] text-[#edab30] border-[#edab30] hover:bg-[#edab30]/20'}`}
          >
            <i className="fa-solid fa-table-cells mr-1"></i> Grid
          </button>
          <button 
            onClick={() => setViewMode('stacked')}
            className={`h-[22px] px-3 text-[10px] font-bold uppercase tracking-wider text-white transition-all shadow-sm rounded-r border border-l-0 border-transparent ${viewMode === 'stacked' ? 'bg-[#edab30] opacity-100' : 'bg-[#254245] text-[#edab30] border-[#edab30] hover:bg-[#edab30]/20'}`}
          >
            <i className="fa-solid fa-layer-group mr-1"></i> Stacked
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 flex-wrap text-[10px] md:text-xs text-white">
           <select 
             className="bg-[#254245] border border-white/20 rounded text-white px-2 py-0.5" 
             value={boardFilters.status} 
             onChange={(e) => setBoardFilters(prev => ({...prev, status: e.target.value}))}
           >
             <option value="">Status: All</option>
             <option value="OPEN">Open</option>
             <option value="IN_PROGRESS">In Progress</option>
             <option value="PENDING">Pending</option>
             <option value="DONE">Done</option>
           </select>

           <select 
             className="bg-[#254245] border border-white/20 rounded text-white px-2 py-0.5" 
             value={boardFilters.taskType} 
             onChange={(e) => setBoardFilters(prev => ({...prev, taskType: e.target.value}))}
           >
             <option value="">Type: All</option>
             <option value="Home Work">Home Work</option>
             <option value="Class Work">Class Work</option>
             <option value="Tuition Work">Tuition Work</option>
             <option value="Test">Test</option>
             <option value="Project">Project</option>
           </select>
           
           <label className="flex items-center space-x-1 cursor-pointer bg-[#edab30]/20 hover:bg-[#edab30]/40 px-2 py-0.5 rounded border border-[#edab30]/50 transition-colors ml-2">
             <input 
               type="checkbox" 
               checked={isBatchMode} 
               onChange={(e) => {
                 setIsBatchMode(e.target.checked);
                 if (!e.target.checked) setSelectedTaskIds([]);
               }}
               className="cursor-pointer"
             />
             <span className="font-bold text-[#edab30]">Batch Select</span>
           </label>
        </div>

        {/* Date and Students Buttons */}
        <div className="relative ml-auto" ref={datePickerRef}>
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
                      <div className="w-6 h-6 shrink-0 rounded-full text-white flex items-center justify-center font-bold text-[9px]" style={{ backgroundColor: getVibrantColor(student.firstName + ' ' + student.secondName) }}>
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

      <div className="w-full h-full bg-white rounded-none shadow-sm border border-gray-100 border-t-4 border-t-teal-700 flex flex-col animate-fadeIn overflow-hidden">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading Grid Data...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <style>{`
              .responsive-table-width {
                width: ${64 + (students.filter(s => selectedStudentIds.includes(s.id)).length * 96)}px;
              }
              @media (min-width: 768px) {
                .responsive-table-width {
                  width: ${80 + (students.filter(s => selectedStudentIds.includes(s.id)).length * 120)}px;
                }
              }
            `}</style>
            <div className="responsive-table-width">
              <table className="text-sm text-left border-separate border-spacing-0 table-fixed responsive-table-width mx-0 mr-auto">
                <colgroup>
                <col className="w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px]" />
                {students.map((student) => {
                  if (!selectedStudentIds.includes(student.id)) return null;
                  return <col key={student.id} className="w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]" />;
                })}
              </colgroup>
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th scope="col" className="w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px] px-2 py-4 sticky left-0 bg-gray-100 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-r border-gray-200">
                  </th>
                  {students.map((student, index) => {
                    if (!selectedStudentIds.includes(student.id)) return null;
                    const isDragged = draggedStudentIdx === index;
                    const isHovered = hoveredStudentIdx === index && !isDragged;
                    // Determine drop indicator side
                    const showLeftIndicator = isHovered && draggedStudentIdx !== null && index < draggedStudentIdx;
                    const showRightIndicator = isHovered && draggedStudentIdx !== null && index > draggedStudentIdx;
                    
                    const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                    const activeTaskCount = filteredCellData.filter(d => 
                      (d.assignee === studentFullName || d.studentName === studentFullName) && 
                      d.status !== 'DONE' && 
                      d.status !== 'COMPLETED'
                    ).length;
                    
                    return (
                      <th 
                        key={student.id} 
                        scope="col" 
                        className="p-0 text-center border-b border-r border-gray-200 whitespace-nowrap w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]"
                      >
                        <div 
                          className={`w-full h-full px-1 py-2 md:px-4 md:py-4 cursor-pointer active:cursor-grabbing hover:bg-gray-100 transition-all group flex flex-col items-center justify-center relative
                            ${isDragged ? 'dragged-column' : ''}
                            ${showLeftIndicator ? 'drop-target-left' : ''}
                            ${showRightIndicator ? 'drop-target-right' : ''}
                            ${highlightedStudentId === student.id ? 'bg-gray-100' : ''}
                          `}
                          onClick={() => setHighlightedStudentId(highlightedStudentId === student.id ? null : student.id)}
                          draggable
                          onDragStart={(e) => handleStudentDragStart(e, index)}
                          onDragEnter={(e) => handleStudentDragEnter(e, index)}
                          onDragOver={(e) => { e.preventDefault(); handleDrag(e); }}
                          onDrag={(e) => handleDrag(e)}
                          onDrop={(e) => handleStudentDrop(e, index)}
                          onDragEnd={handleStudentDragEnd}
                        >
                          <div className={`flex flex-col items-center justify-center relative ${isDragged ? 'opacity-50' : ''}`}>
                            <div className="relative">
                              <div className="w-6 h-6 text-[10px] md:w-8 md:h-8 md:text-sm rounded-full text-white flex items-center justify-center font-bold mb-1 md:mb-2 shadow-sm" style={{ backgroundColor: getVibrantColor(student.firstName + ' ' + student.secondName) }}>
                                {student.firstName.charAt(0)}{student.secondName.charAt(0)}
                              </div>
                              {activeTaskCount > 0 && (
                                <div 
                                  className="absolute -top-1 -right-2 md:-right-1.5 bg-[#ef4444] text-white text-[8px] font-bold min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full shadow-sm border border-white"
                                  title={`${activeTaskCount} active/pending tasks`}
                                >
                                  {activeTaskCount}
                                </div>
                              )}
                            </div>
                            <span className="truncate w-full text-[9px] md:text-xs text-center max-w-[80px] md:max-w-[100px]" title={`${student.firstName} ${student.secondName}`}>
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
                {tableRows.map((row) => {
                  const isGrid = viewMode === 'grid';
                  const index = row.index;
                  const subject = row.subject;
                  
                  const isDragged = isGrid && draggedSubjectIdx === index;
                  const isHovered = isGrid && hoveredSubjectIdx === index && !isDragged;
                  const showTopIndicator = isHovered && draggedSubjectIdx !== null && index < draggedSubjectIdx;
                  const showBottomIndicator = isHovered && draggedSubjectIdx !== null && index > draggedSubjectIdx;
                  
                  return (
                    <tr 
                      key={row.id} 
                      className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                        group
                      `}
                      onDragEnter={(e) => isGrid && handleSubjectDragEnter(e, index)}
                      onDragOver={(e) => { e.preventDefault(); isGrid && handleDrag(e); }}
                      onDrop={(e) => isGrid && handleSubjectDrop(e, index)}
                    >
                      <th 
                        scope="row" 
                        className="w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px] p-0 font-medium text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-200 bg-inherit whitespace-nowrap align-middle h-24 md:h-[120px]"
                      >
                        <div 
                          className={`flex items-center justify-center w-full h-full px-2 transition-all
                            ${isGrid ? 'cursor-pointer active:cursor-grabbing hover:bg-gray-100' : ''}
                            ${isDragged ? 'dragged-row' : ''}
                            ${showTopIndicator ? 'drop-target-top' : ''}
                            ${showBottomIndicator ? 'drop-target-bottom' : ''}
                            ${isGrid && subject && highlightedSubjectId === subject.id ? 'bg-gray-100' : ''}
                          `}
                          onClick={() => isGrid && subject && setHighlightedSubjectId(highlightedSubjectId === subject.id ? null : subject.id)}
                          draggable={isGrid}
                          onDragStart={(e) => isGrid && handleSubjectDragStart(e, index)}
                          onDrag={(e) => isGrid && handleDrag(e)}
                          onDragEnd={isGrid ? handleSubjectDragEnd : undefined}
                        >
                          <span className="text-center font-bold">{isGrid && subject ? (subject.code || subject.name) : ''}</span>
                        </div>
                      </th>
                      
                      {students.map((student, studentIndex) => {
                        if (!selectedStudentIds.includes(student.id)) return null;
                        
                        let stackedTask = null;
                        if (!isGrid) {
                          const studentData = tasksPerStudent.find(s => s.studentId === student.id);
                          stackedTask = studentData?.tasks[index];
                          // If stacked view and no task
                          if (!stackedTask) {
                            if (index === (studentData?.tasks?.length || 0)) {
                              return (
                                <td key={`stacked-${student.id}-${index}`} className="p-0 text-center border-none bg-transparent h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]">
                                  <div className="w-24 h-24 md:w-[120px] md:h-[120px] relative p-1.5 pb-5">
                                    <div 
                                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-300 rounded-[4px] group"
                                      onClick={() => {
                                        if (isBatchMode) return;
                                        setNewEntryModal({
                                          type: activeView,
                                          subject: '',
                                          studentName: `${student.firstName} ${student.secondName}`.trim(),
                                          date: selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date())
                                        });
                                      }}
                                    >
                                      <span className="text-gray-400 text-3xl font-light group-hover:text-[#254245] transition-colors">+</span>
                                    </div>
                                  </div>
                                </td>
                              );
                            }
                            // Otherwise completely empty cell without borders
                            return <td key={`stacked-${student.id}-${index}`} className="p-0 border-none bg-transparent h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]"></td>;
                          }
                        }

                        const isAssigned = isGrid 
                          ? student.subjects.some(s => subject && s.trim().toLowerCase() === subject.name.trim().toLowerCase())
                          : true; // In stacked view, it's always assigned if a task is present
                          
                        const isStudentDragged = draggedStudentIdx === studentIndex;
                        const isStudentHovered = hoveredStudentIdx === studentIndex && !isStudentDragged;
                        const showLeftIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex < draggedStudentIdx;
                        const showRightIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex > draggedStudentIdx;
                        
                        const cellId = isGrid && subject ? `${subject.id}-${student.id}` : `stacked-${student.id}-${index}`;
                        const isClicked = clickedCellId === cellId;
                        const isHighlightedColumn = highlightedStudentId === student.id;
                        const isHighlightedRow = isGrid && subject && highlightedSubjectId === subject.id;
                        
                        return (
                          <td 
                            key={cellId} 
                            className="p-0 text-center border-b border-r border-gray-200 last:border-r-0 h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]"
                            onDragEnter={(e) => {
                              if (!isAssigned) return;
                              if (draggedTaskId !== null && draggedTaskSource && (e.shiftKey || e.altKey || e.metaKey)) {
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                if (!clonedCells.has(cellId)) {
                                  handleCloneTask(draggedTaskSource, studentFullName);
                                  setClonedCells(prev => new Set(prev).add(cellId));
                                }
                              }
                            }}
                            onDragOver={(e) => {
                              if (!isAssigned) return;
                              if (draggedTaskId !== null) {
                                e.preventDefault(); // allow drop
                                e.dataTransfer.dropEffect = (e.shiftKey || e.altKey || e.metaKey) ? 'copy' : 'move';
                              }
                            }}
                            onDrop={(e) => {
                              if (!isAssigned) return;
                              if (draggedTaskId !== null) {
                                e.preventDefault();
                                e.stopPropagation();
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                
                                if (e.altKey || e.shiftKey || e.metaKey) {
                                  if (!clonedCells.has(cellId) && draggedTaskSource) {
                                    handleCloneTask(draggedTaskSource, studentFullName);
                                  }
                                } else {
                                  handleUpdateTaskField(draggedTaskId, 'assignee', studentFullName);
                                }
                                
                                setDraggedTaskId(null);
                                setDraggedTaskSource(null);
                                setClonedCells(new Set());
                              }
                            }}
                          >
                            <div className="w-24 h-24 md:w-[120px] md:h-[120px] relative">
                              <div 
                              onClick={() => {
                                if (isBatchMode) return;
                                
                                // Always toggle highlight for this column when clicking any cell
                                setHighlightedStudentId(highlightedStudentId === student.id ? null : student.id);
                                
                                if (!isAssigned) return;
                                
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                let items = [];
                                if (isGrid && subject) {
                                  items = filteredCellData.filter(d => 
                                    (d.assignee === studentFullName || d.studentName === studentFullName) && 
                                    d.subject === subject.name
                                  );
                                } else {
                                  const studentData = tasksPerStudent.find(s => s.studentId === student.id);
                                  const task = studentData?.tasks[index];
                                  if (task) items = [task];
                                }
                                
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
                              style={(isHighlightedColumn && !isClicked) ? { backgroundColor: getVibrantColor(student.firstName + ' ' + student.secondName) + '26' } : undefined}
                              className={`
                                w-full h-full transition-all duration-300 flex items-center justify-center cursor-pointer
                                ${isClicked ? 'overflow-visible' : 'overflow-hidden'}
                                ${(!isAssigned && !isDragged && !isStudentDragged && !(isHighlightedColumn && !isClicked) && !(isHighlightedRow && !isClicked)) ? 'unassigned-cell' : ((isHighlightedColumn && !isClicked) ? '' : ((isHighlightedRow && !isClicked) ? 'bg-[#edab30]/15' : 'bg-white'))}
                                ${isAssigned ? 'hover:bg-gray-50' : ''}
                                ${isClicked ? 'transform scale-[2] origin-center z-[60] shadow-[0_0_30px_rgba(0,0,0,0.3)] absolute top-0 left-0 bg-white' : 'transform scale-100 z-0 relative'}
                                ${isDragged || isStudentDragged ? 'dragged-column dragged-row' : ''}
                                ${showLeftIndicator ? 'drop-target-left' : ''}
                                ${showRightIndicator ? 'drop-target-right' : ''}
                                ${showTopIndicator ? 'drop-target-top' : ''}
                                ${showBottomIndicator ? 'drop-target-bottom' : ''}
                              `}
                            >
                                {isAssigned && filteredCellData && filteredCellData.length > 0 && (() => {
                                const studentFullName = `${student.firstName} ${student.secondName}`.trim();
                                let items = [];
                                if (isGrid && subject) {
                                  items = filteredCellData.filter(d => 
                                    (d.assignee === studentFullName || d.studentName === studentFullName) && 
                                    d.subject === subject.name
                                  );
                                } else {
                                  if (stackedTask) items = [stackedTask];
                                }
                                
                                if (items.length === 0) return null;
                                
                                return (
                                <div className="w-full h-full flex flex-col items-center justify-center relative">
                                    {items.slice(0, 1).map((item, idx) => {
                                      if (activeView === 'query') {
                                        return (
                                          <div key={idx} className="w-full h-full bg-[#edab30]/10 border border-[#edab30]/30 p-1 flex flex-col items-center justify-center">
                                            <span className="text-[9px] font-bold text-[#254245] truncate w-full text-center uppercase">Query</span>
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${item.status === 'OPEN' || item.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                              {item.status}
                                            </span>
                                          </div>
                                        );
                                      }

                                      const typeBadge = getTaskTypeBadge(item.taskType || 'Task');
                                      const statusColor = getStatusColor(item.status);
                                      
                                      return (
                                        <div 
                                          key={idx} 
                                          draggable={!isBatchMode}
                                          onDragStart={(e) => {
                                            if (isBatchMode) return;
                                            e.dataTransfer.effectAllowed = 'copyMove';
                                            e.dataTransfer.setData('text/plain', item.id.toString());
                                            setDraggedTaskId(item.id);
                                            setDraggedTaskSource(item);
                                            e.stopPropagation();
                                          }}
                                          onDragEnd={() => {
                                            setDraggedTaskId(null);
                                            setDraggedTaskSource(null);
                                            setClonedCells(new Set());
                                          }}
                                          onClick={(e) => {
                                            if (isBatchMode) {
                                              e.stopPropagation();
                                              setSelectedTaskIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                                            }
                                          }}
                                          className={`w-full h-full relative p-1.5 pb-5 flex flex-col justify-start items-start rounded-[4px] shadow-sm ${isClicked ? 'overflow-visible' : 'overflow-hidden'} ${selectedTaskIds.includes(item.id) ? 'ring-4 ring-[#edab30] border-transparent' : ''}`}
                                          style={selectedTaskIds.includes(item.id) ? { backgroundColor: `${statusColor}15` } : { backgroundColor: `${statusColor}15`, border: `1px solid ${statusColor}40` }}
                                        >
                                          {/* Delete Button (Bottom Left, visible only when clicked) */}
                                          {isClicked && (
                                            <div className="absolute bottom-0 left-0 z-[70] flex items-center justify-center p-1 rounded-bl-[4px]">
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteInitiate(item.id); }}
                                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                title="Delete Task"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M3 6h18" />
                                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                  <line x1="10" y1="11" x2="10" y2="17" />
                                                  <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                              </button>
                                            </div>
                                          )}

                                          {/* Badges Container (Bottom Right) */}
                                          <div className={`absolute bottom-0 right-0 flex z-[70] rounded-tl-[4px] ${isClicked ? 'overflow-visible' : 'overflow-hidden'}`}>
                                            {/* Subject Badge (Only in Stacked View) */}
                                            {!isGrid && (
                                              <div 
                                                className="w-auto px-1.5 h-4 flex items-center justify-center text-white text-[8px] font-bold bg-[#254245]"
                                                title={item.subject}
                                              >
                                                {subjects.find(s => s.name === item.subject)?.code || item.subject}
                                              </div>
                                            )}
                                            {/* Task Type Badge */}
                                            <div 
                                              className={`w-5 h-4 flex items-center justify-center text-white text-[8px] font-bold ${isClicked ? 'cursor-pointer hover:opacity-90' : ''}`}
                                              style={{ backgroundColor: typeBadge.color }}
                                              title={item.taskType}
                                              onClick={(e) => { 
                                                if (!isClicked) return;
                                                e.stopPropagation(); 
                                                setActiveDropdown(activeDropdown === `${item.id}-type` ? null : `${item.id}-type`); 
                                              }}
                                            >
                                              {typeBadge.initials}
                                            </div>
                                            
                                            {activeDropdown === `${item.id}-type` && isClicked && (
                                              <div className="absolute bottom-4 right-5 flex flex-col-reverse gap-1 z-[80] bg-white p-1 shadow-lg border rounded" onClick={(e) => e.stopPropagation()}>
                                                {['Tuition Work', 'Class Work', 'Home Work', 'Test', 'Project']
                                                  .filter(t => t !== item.taskType)
                                                  .map(t => {
                                                  const b = getTaskTypeBadge(t);
                                                  return (
                                                    <button 
                                                      key={t}
                                                      className="w-5 h-4 flex items-center justify-center text-white text-[8px] font-bold shadow-md hover:scale-110 transition-transform"
                                                      style={{ backgroundColor: b.color }}
                                                      onClick={() => handleUpdateTaskField(item.id, 'taskType', t)}
                                                      title={t}
                                                    >
                                                      {b.initials}
                                                    </button>
                                                  )
                                                })}
                                              </div>
                                            )}
                                            
                                            {/* Status Badge */}
                                            <div 
                                              className={`w-5 h-4 flex items-center justify-center text-white text-[8px] font-bold ${isClicked ? 'cursor-pointer hover:opacity-90' : ''}`}
                                              style={{ backgroundColor: statusColor }}
                                              title={item.status}
                                              onClick={(e) => { 
                                                if (!isClicked) return;
                                                e.stopPropagation(); 
                                                setActiveDropdown(activeDropdown === `${item.id}-status` ? null : `${item.id}-status`); 
                                              }}
                                            >
                                              {getStatusInitials(item.status)}
                                            </div>
                                            
                                            {activeDropdown === `${item.id}-status` && isClicked && (
                                              <div className="absolute bottom-4 right-0 flex flex-col-reverse gap-1 z-[80] bg-white p-1 shadow-lg border rounded" onClick={(e) => e.stopPropagation()}>
                                                {['OPEN', 'IN_PROGRESS', 'DONE', 'PENDING']
                                                  .filter(s => s !== item.status)
                                                  .map(s => (
                                                  <button 
                                                    key={s}
                                                    className="w-5 h-4 flex items-center justify-center text-white text-[8px] font-bold shadow-md hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: getStatusColor(s) }}
                                                    onClick={() => handleUpdateTaskField(item.id, 'status', s)}
                                                    title={s}
                                                  >
                                                    {getStatusInitials(s)}
                                                  </button>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          {/* Main Content */}
                                          {isClicked ? (
                                            (() => {
                                              const availableChapters = chaptersList.filter(c => c.subject === item.subject && c.book === item.book);
                                              const availableTopics = topicsList.filter(t => t.subject === item.subject && t.book === item.book && t.chapterName === item.chapter);
                                              const uniqueTopicNames = Array.from(new Set(availableTopics.map(t => t.topicName)));
                                              const uniqueExercises = Array.from(new Set(availableTopics.filter(t => t.topicName === item.topic && t.exercise).map(t => t.exercise)));

                                              return (
                                                <div className="flex flex-col flex-1 w-full text-left mt-0 gap-[1px]" onClick={(e) => e.stopPropagation()}>
                                                  <div className="flex items-center w-full">
                                                    <span className="text-[12px] font-black text-gray-900 mr-1">Ch</span>
                                                    <select 
                                                      value={item.chapter || ''} 
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        handleUpdateTaskField(item.id, 'chapter', val);
                                                        handleUpdateTaskField(item.id, 'topic', '');
                                                        handleUpdateTaskField(item.id, 'exercise', '');
                                                      }}
                                                      className="text-[12px] font-black text-gray-900 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors rounded-none"
                                                    >
                                                      <option value="" disabled>-</option>
                                                      {availableChapters.map(c => (
                                                        <option key={c.id} value={c.chapterTitle || c.chapterName}>{c.chapterTitle || c.chapterName}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                  <div className="flex items-center w-full mt-[1px]">
                                                    <span className="text-[10px] font-bold text-gray-800 mr-1">Tp</span>
                                                    <select 
                                                      value={item.topic || ''}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        handleUpdateTaskField(item.id, 'topic', val);
                                                        handleUpdateTaskField(item.id, 'exercise', '');
                                                      }}
                                                      className="text-[10px] font-bold text-gray-800 w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors rounded-none"
                                                    >
                                                      <option value="" disabled>Topic...</option>
                                                      {uniqueTopicNames.map((tName, i) => (
                                                        <option key={i} value={tName as string}>{tName as string}</option>
                                                      ))}
                                                    </select>
                                                  </div>
                                                  <select 
                                                    value={item.exercise || ''}
                                                    onChange={(e) => handleUpdateTaskField(item.id, 'exercise', e.target.value)}
                                                    className="text-[9px] font-semibold text-gray-700 w-full italic bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors rounded-none"
                                                  >
                                                    <option value="" disabled>Exercise...</option>
                                                    {uniqueExercises.map((ex, i) => (
                                                      <option key={i} value={ex as string}>{ex as string}</option>
                                                    ))}
                                                  </select>
                                                  <textarea 
                                                    defaultValue={item.description || ''}
                                                    placeholder="Description..."
                                                    onBlur={(e) => { if(e.target.value !== (item.description || '')) handleUpdateTaskField(item.id, 'description', e.target.value) }}
                                                    className="text-[8px] text-black font-semibold mt-1 w-[90%] leading-tight text-left bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition-colors resize-none min-h-[40px] whitespace-normal custom-scrollbar rounded-none"
                                                  />
                                                </div>
                                              );
                                            })()
                                          ) : (
                                            <div className="flex flex-col flex-1 w-full text-left mt-0 overflow-hidden pr-2">
                                              <span className="text-[12px] font-black text-gray-900 truncate w-full leading-tight mb-[1px]">Ch {item.chapter || '-'}</span>
                                              <span className="text-[10px] font-bold text-gray-800 truncate w-full leading-tight mb-[1px]">Tp {item.topic || '-'}</span>
                                              {item.exercise && <span className="text-[9px] font-semibold text-gray-700 truncate w-full italic leading-tight mb-[1px]">{item.exercise}</span>}
                                              {item.description && <span className="text-[8px] text-black font-semibold mt-0.5 w-full leading-tight text-left line-clamp-2">{item.description}</span>}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    

                                  </div>
                                );
                              })()}
                            </div>
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
            </div>
        )}
      </div>

      {/* Batch Select Floating Action Bar */}
      {isBatchMode && selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-[#edab30]/30 px-6 py-4 flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">{selectedTaskIds.length} Tasks Selected</span>
            <span className="text-xs text-gray-500">Choose action to apply</span>
          </div>
          
          <div className="h-8 w-px bg-gray-200"></div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleBatchUpdate('status', 'DONE')}
              className="px-4 py-2 bg-[#237f5d] hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Mark Done
            </button>
            <button 
              onClick={() => handleBatchUpdate('status', 'IN_PROGRESS')}
              className="px-4 py-2 bg-[#007AFF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Mark In Progress
            </button>
            <button 
              onClick={() => handleBatchUpdate('status', 'PENDING')}
              className="px-4 py-2 bg-[#f0be39] hover:bg-yellow-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Mark Pending
            </button>
            <button 
              onClick={() => handleBatchUpdate('status', 'OPEN')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Mark Open
            </button>
            <button 
              onClick={() => {
                setSelectedTaskIds([]);
                setIsBatchMode(false);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-colors ml-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {newEntryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNewEntryModal(null)}></div>
          <div className="w-full max-w-4xl relative z-10">
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
      {/* Undo Toast Notification */}
      {toastConfig.visible && (
        <div className="fixed bottom-6 right-6 z-[300] bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-4 animate-slide-up">
          <span className="text-sm font-medium">Task deleted.</span>
          <button 
            onClick={handleUndoDelete}
            className="text-sm font-bold text-[#edab30] hover:text-yellow-300 focus:outline-none transition-colors"
          >
            Undo
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {taskToDelete !== null && (
        <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Task</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this task? This action can be undone within 7 seconds.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
