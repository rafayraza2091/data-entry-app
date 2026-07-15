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

const getReporterColor = (reporterStr: string | null | undefined) => {
  if (!reporterStr) return getVibrantColor('?');
  const lower = reporterStr.toLowerCase();
  if (lower.includes('rafay')) return '#254245'; // Dark Teal
  if (lower.includes('tayyaba')) return '#f58231'; // Orange
  if (lower.includes('rabia')) return '#D81B60'; // Dark Pink (Rose)
  return getVibrantColor(reporterStr);
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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const activeStudentIdRef = useRef<number | null>(null);
  const activeSubjectIdRef = useRef<number | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const updateHighlight = useCallback((subjectId: number | null, studentId: number | null, shouldScroll: boolean = false) => {
    activeSubjectIdRef.current = subjectId;
    activeStudentIdRef.current = studentId;
    if (gridContainerRef.current) {
      if (subjectId !== null) gridContainerRef.current.setAttribute('data-active-subject', subjectId.toString());
      else gridContainerRef.current.removeAttribute('data-active-subject');

      if (studentId !== null) gridContainerRef.current.setAttribute('data-active-student', studentId.toString());
      else gridContainerRef.current.removeAttribute('data-active-student');
    }

    if (shouldScroll) {
      if (subjectId !== null) {
        const el = document.getElementById(`subject-row-${subjectId}`);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
      }
      if (studentId !== null) {
        const el = document.getElementById(`student-col-${studentId}`);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
      }
    }
  }, []);

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRow, setCurrentRow] = useState<number | null>(null);
  const [currentCol, setCurrentCol] = useState<number | null>(null);

  const [activeView, setActiveView] = useState<'task' | 'query'>('task');
  const [currentDate, setCurrentDate] = useState('');

  // Custom dropdown states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [isFilterStatusOpen, setIsFilterStatusOpen] = useState(false);
  const [isFilterTypeOpen, setIsFilterTypeOpen] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentCategoryFilter, setStudentCategoryFilter] = useState<'All' | 'Olevels' | 'Matric' | 'Junior'>('All');
  const [cellData, setCellData] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'stacked'>('grid');
  const [reportersList, setReportersList] = useState<string[]>([]);

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
  const copiedTaskRef = useRef<any>(null);
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
    const newStudent = students.find(s => `${s.firstName} ${s.secondName}`.trim() === newAssignee.trim());
    const newClassName = newStudent?.className || task.className;

    // Generate a temporary ID for optimistic UI
    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const dateToUse = selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date());

    const newTask = {
      ...task,
      id: tempId,
      assignee: newAssignee,
      className: newClassName,
      ...(activeView === 'task' ? { dueDate: dateToUse } : { createdAt: dateToUse }),
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
          className: newClassName,
          ...(activeView === 'task' ? { dueDate: dateToUse } : { createdAt: dateToUse }),
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
  const filterStatusRef = useRef<HTMLDivElement>(null);
  const filterTypeRef = useRef<HTMLDivElement>(null);
  const studentSearchInputRef = useRef<HTMLInputElement>(null);
  const numberBufferRef = useRef<string>('');
  const numberTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) { }
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
      if (filterStatusRef.current && !filterStatusRef.current.contains(event.target as Node)) {
        setIsFilterStatusOpen(false);
      }
      if (filterTypeRef.current && !filterTypeRef.current.contains(event.target as Node)) {
        setIsFilterTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (document.activeElement === studentSearchInputRef.current) {
          studentSearchInputRef.current?.blur();
          setStudentSearchQuery('');
          updateHighlight(activeSubjectIdRef.current, null);
        } else {
          studentSearchInputRef.current?.focus();
        }
        return;
      }

      const isInputFocused = document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      if (!isInputFocused) {
        if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
          event.preventDefault();
          setSelectedDate(prev => {
            const d = prev ? new Date(prev) : new Date();
            d.setDate(d.getDate() + 1);
            return new Date(d);
          });
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft') {
          event.preventDefault();
          setSelectedDate(prev => {
            const d = prev ? new Date(prev) : new Date();
            d.setDate(d.getDate() - 1);
            return new Date(d);
          });
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
          event.preventDefault();
          setSelectedDate(new Date());
          return;
        }
      }
      if (event.key === 'Escape' || event.key === 'Esc') {
        if (document.activeElement === studentSearchInputRef.current || studentSearchQuery !== '') {
          studentSearchInputRef.current?.blur();
          setStudentSearchQuery('');
          updateHighlight(activeSubjectIdRef.current, null);
        } else if (activeDropdown !== null) {
          setActiveDropdown(null);
        } else if (newEntryModal !== null || clickedCellId !== null || isDatePickerOpen || isStudentPickerOpen || isFilterStatusOpen || isFilterTypeOpen) {
          // If a modal, floating cell, or dropdown is open, close only them
          setNewEntryModal(null);
          setClickedCellId(null);
          setIsDatePickerOpen(false);
          setIsStudentPickerOpen(false);
          setIsFilterStatusOpen(false);
          setIsFilterTypeOpen(false);
        } else {
          const activeEl = document.activeElement as HTMLElement;
          const isGridCell = activeEl?.tagName === 'TD' && activeEl?.hasAttribute('data-subject-id');

          if (!isGridCell && activeEl && activeEl !== document.body) {
            // Return focus to the grid
            let cellToFocus: HTMLElement | null = null;
            if (activeSubjectIdRef.current !== null && activeStudentIdRef.current !== null) {
              cellToFocus = document.querySelector(`td[data-subject-id="${activeSubjectIdRef.current}"][data-student-id="${activeStudentIdRef.current}"]`) as HTMLElement;
            }
            if (!cellToFocus) {
              cellToFocus = document.querySelector('.grid-container td[data-subject-id]') as HTMLElement;
            }
            if (cellToFocus) {
              cellToFocus.focus();
              return;
            }
          }

          // Otherwise, if already in grid, turn off the row/column highlighting
          updateHighlight(null, null);
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newEntryModal, clickedCellId, isDatePickerOpen, isStudentPickerOpen, activeDropdown]);

  useEffect(() => {
    function handleShortcutM(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();

        let studentName = '';
        if (activeStudentIdRef.current !== null) {
          const student = students.find(s => s.id === activeStudentIdRef.current);
          if (student) {
            studentName = `${student.firstName} ${student.secondName}`.trim();
          }
        }

        setNewEntryModal({
          type: activeView,
          subject: '',
          studentName,
          date: selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date())
        });
      }
    }
    document.addEventListener("keydown", handleShortcutM);
    return () => document.removeEventListener("keydown", handleShortcutM);
  }, [students, activeView, selectedDate]);

  let formattedDate = selectedDate ? currentDate : 'Today';
  if (selectedDate) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(selectedDate, today)) {
      formattedDate = 'Today';
    } else if (isSameDay(selectedDate, yesterday)) {
      formattedDate = 'Yesterday';
    } else if (isSameDay(selectedDate, tomorrow)) {
      formattedDate = 'Tomorrow';
    } else {
      formattedDate = selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

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

        const [response, chapRes, topRes, taskUsersRes] = await Promise.all([
          fetch(`/api/bird-view?date=${initialDateStr}&view=task`),
          fetch('/api/chapters'),
          fetch('/api/topics'),
          fetch('/api/task-users')
        ]);

        if (chapRes.ok) setChaptersList(await chapRes.json());
        if (topRes.ok) setTopicsList(await topRes.json());

        if (taskUsersRes.ok) {
          const data = await taskUsersRes.json();
          const names = [...(data.teachers || []), ...(data.admins || []), ...(data.owners || [])]
            .map(u => `${u.firstName || ''} ${u.lastName || ''}`.trim())
            .filter(Boolean);
          setReportersList(Array.from(new Set(names)));
        }

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
  const handleStudentDragStart = (e: React.DragEvent<any>, index: number) => {
    setDraggedStudentIdx(index);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      setTransparentDragImage(e);
    }
  };

  const handleStudentDragEnter = (e: React.DragEvent<any>, index: number) => {
    e.preventDefault();
    if (draggedStudentIdx === null) return;
    setHoveredStudentIdx(index);
  };

  const handleStudentDrop = (e: React.DragEvent<any>, dropIndex: number) => {
    e.preventDefault();
    if (draggedStudentIdx === null || draggedStudentIdx === dropIndex) {
      setDraggedStudentIdx(null);
      setHoveredStudentIdx(null);
      return;
    }

    const newStudents = [...students];
    const draggedItem = newStudents[draggedStudentIdx];
    newStudents.splice(draggedStudentIdx, 1);
    newStudents.splice(dropIndex, 0, draggedItem);

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
  const handleSubjectDragStart = (e: React.DragEvent<any>, index: number) => {
    setDraggedSubjectIdx(index);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      setTransparentDragImage(e);
    }
  };

  const handleSubjectDragEnter = (e: React.DragEvent<any>, index: number) => {
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

  const visibleStudentIds = useMemo(() => {
    const searchLower = studentSearchQuery.toLowerCase().trim();
    return selectedStudentIds.filter(id => {
      const student = students.find(s => s.id === id);
      if (!student) return false;
      if (searchLower === '') return true;
      const fullName = `${student.firstName} ${student.secondName}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [students, selectedStudentIds, studentSearchQuery]);

  useEffect(() => {
    if (studentSearchQuery.trim() !== '') {
      if (visibleStudentIds.length === 1) {
        updateHighlight(activeSubjectIdRef.current, visibleStudentIds[0] || null);
      } else {
        updateHighlight(activeSubjectIdRef.current, null);
      }
    }
  }, [visibleStudentIds, studentSearchQuery]);



  useEffect(() => {
    function handleNumberShortcut(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'e' && !event.metaKey && !event.ctrlKey) {
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) {
          event.preventDefault();
          setIsFilterStatusOpen(false);
          setIsFilterTypeOpen(false);
          setIsDatePickerOpen(false);
          setIsStudentPickerOpen(false);
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setIsEditMode(prev => {
            const next = !prev;
            if (next) {
              setCurrentRow(0);
              setCurrentCol(0);
            } else {
              setCurrentRow(null);
              setCurrentCol(null);
            }
            return next;
          });
          return;
        }
      }

      if (event.key === 'Escape') {
        if (isBatchMode) {
          event.preventDefault();
          setIsBatchMode(false);
          setSelectedTaskIds([]);
        }
        setIsFilterStatusOpen(false);
        setIsFilterTypeOpen(false);
        setIsDatePickerOpen(false);
        setIsStudentPickerOpen(false);
        setClickedCellId(null);
        setNewEntryModal(null);
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement).tagName)) return;

      const digitMatch = event.code.match(/^Digit([0-9])$/);
      if (digitMatch) {
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        const digit = digitMatch[1];
        numberBufferRef.current += digit;

        const index = parseInt(numberBufferRef.current, 10) - 1;
        if (!isNaN(index) && index >= 0) {
          if (event.shiftKey) {
            if (viewMode === 'grid' && index < subjects.length) {
              updateHighlight(subjects[index].id, activeStudentIdRef.current);
            }
          } else {
            if (index < visibleStudentIds.length) {
              updateHighlight(activeSubjectIdRef.current, visibleStudentIds[index]);
            }
          }
        }

        if (numberTimeoutRef.current) {
          clearTimeout(numberTimeoutRef.current);
        }

        numberTimeoutRef.current = setTimeout(() => {
          numberBufferRef.current = '';
        }, 200);
      }
      if (isEditMode) {
        if (event.key === '+' || (event.key.toLowerCase() === 'c' && (event.metaKey || event.ctrlKey))) {
          if (currentRow !== null && currentCol !== null && subjects[currentRow]) {
            const studentId = visibleStudentIds[currentCol];
            const student = students.find(s => s.id === studentId);
            if (student) {
              const subject = subjects[currentRow];
              const studentFullName = `${student.firstName} ${student.secondName}`.trim();

              const cellTasks = filteredCellData.filter(d =>
                (d.assignee === studentFullName || d.studentName === studentFullName) &&
                d.subject === subject.name
              );

              if (cellTasks.length > 0) {
                copiedTaskRef.current = cellTasks[0];
              }
            }
          }
          if (event.key.toLowerCase() === 'c') event.preventDefault();
          return;
        }

        if (event.key.toLowerCase() === 'v' && (event.metaKey || event.ctrlKey)) {
          const copiedTask = copiedTaskRef.current;
          if (copiedTask && currentRow !== null && currentCol !== null && subjects[currentRow]) {
            const studentId = visibleStudentIds[currentCol];
            const student = students.find(s => s.id === studentId);
            if (student) {
              const subject = subjects[currentRow];
              const studentFullName = `${student.firstName} ${student.secondName}`.trim();

              if (subject.name !== copiedTask.subject) {
                alert("Tasks can only be pasted horizontally within the same subject row.");
              } else {
                handleCloneTask(copiedTask, studentFullName);
              }
            }
          }
          event.preventDefault();
          return;
        }

        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (currentRow !== null && currentCol !== null && subjects[currentRow]) {
            const studentId = visibleStudentIds[currentCol];
            const student = students.find(s => s.id === studentId);
            if (student) {
              const subject = subjects[currentRow];
              const studentFullName = `${student.firstName} ${student.secondName}`.trim();

              const cellTasks = filteredCellData.filter(d =>
                (d.assignee === studentFullName || d.studentName === studentFullName) &&
                d.subject === subject.name
              );

              if (cellTasks.length > 0) {
                handleDeleteInitiate(cellTasks[0].id);
              }
            }
          }
          event.preventDefault();
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          event.preventDefault();

          setCurrentRow(prevRow => {
            let newRow = prevRow === null ? 0 : prevRow;
            if (event.key === 'ArrowUp') newRow = Math.max(0, newRow - 1);
            if (event.key === 'ArrowDown') newRow = Math.min(subjects.length - 1, newRow + 1);
            return newRow;
          });

          setCurrentCol(prevCol => {
            let newCol = prevCol === null ? 0 : prevCol;
            if (event.key === 'ArrowLeft') newCol = Math.max(0, newCol - 1);
            if (event.key === 'ArrowRight') newCol = Math.min(visibleStudentIds.length - 1, newCol + 1);
            return newCol;
          });
          return;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          if (currentRow !== null && currentCol !== null && subjects[currentRow]) {
            const studentId = visibleStudentIds[currentCol];
            const student = students.find(s => s.id === studentId);
            if (student) {
              const subject = subjects[currentRow];
              const studentFullName = `${student.firstName} ${student.secondName}`.trim();

              const cellHasTasks = filteredCellData.some(d =>
                (d.assignee === studentFullName || d.studentName === studentFullName) &&
                d.subject === subject.name
              );

              if (!cellHasTasks) {
                const isAssigned = student.subjects && student.subjects.some((s: string) => subject && s.trim().toLowerCase() === subject.name.trim().toLowerCase());
                if (isAssigned) {
                  setNewEntryModal({
                    type: activeView,
                    subject: subject.name,
                    studentName: studentFullName,
                    date: selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date())
                  });
                }
              } else {
                const cellId = `${subject.id}-${student.id}`;
                setClickedCellId(clickedCellId === cellId ? null : cellId);
              }
            }
          }
        }
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const prev = activeStudentIdRef.current;
        let newId = prev;
        if (!prev) newId = visibleStudentIds.length > 0 ? visibleStudentIds[0] : null;
        else {
          const currentIndex = visibleStudentIds.indexOf(prev);
          if (currentIndex === -1) newId = visibleStudentIds.length > 0 ? visibleStudentIds[0] : null;
          else {
            let newIndex = event.key === 'ArrowRight' ? currentIndex + 1 : currentIndex - 1;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= visibleStudentIds.length) newIndex = visibleStudentIds.length - 1;
            newId = visibleStudentIds[newIndex];
          }
        }
        updateHighlight(activeSubjectIdRef.current, newId, true);
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const prev = activeSubjectIdRef.current;
        let newId = prev;
        if (!prev) newId = subjects.length > 0 ? subjects[0].id : null;
        else {
          const currentIndex = subjects.findIndex(s => s.id === prev);
          if (currentIndex === -1) newId = subjects.length > 0 ? subjects[0].id : null;
          else {
            let newIndex = event.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= subjects.length) newIndex = subjects.length - 1;
            newId = subjects[newIndex].id;
          }
        }
        updateHighlight(newId, activeStudentIdRef.current, true);
      }

    }

    document.addEventListener('keydown', handleNumberShortcut);
    return () => {
      document.removeEventListener('keydown', handleNumberShortcut);
      if (numberTimeoutRef.current) clearTimeout(numberTimeoutRef.current);
    };
  }, [visibleStudentIds, subjects, viewMode, isBatchMode, isEditMode, currentRow, currentCol, students, activeView, selectedDate, filteredCellData, clickedCellId]);

  useEffect(() => {
    if (clickedCellId) {
      const timeoutId = setTimeout(() => {
        const cellEl = document.getElementById(`cell-${clickedCellId}`);
        if (cellEl) {
          let targetElement = cellEl.querySelector('textarea');
          if (!targetElement) {
            targetElement = cellEl.querySelector('select, input, textarea');
          }
          if (targetElement) {
            (targetElement as HTMLElement).focus();
          } else {
            const focusableElements = cellEl.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [clickedCellId]);

  useEffect(() => {
    if (taskToDelete === null) return;

    const handleModalKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (e.key === 'Enter') {
        handleDeleteConfirm();
      } else if (e.key === 'Escape') {
        setTaskToDelete(null);
      }
    };

    window.addEventListener('keydown', handleModalKeydown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleModalKeydown, { capture: true });
    };
  }, [taskToDelete]);

  useEffect(() => {
    const handleUndoShortcut = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) {
        if (toastConfig.visible && toastConfig.taskId !== null) {
          e.preventDefault();
          handleUndoDelete();
        }
      }
    };
    window.addEventListener('keydown', handleUndoShortcut);
    return () => window.removeEventListener('keydown', handleUndoShortcut);
  }, [toastConfig]);



  useEffect(() => {
    if (isEditMode && currentRow !== null && currentCol !== null && viewMode === 'grid') {
      const subject = subjects[currentRow];
      const studentId = visibleStudentIds[currentCol];
      if (subject && studentId) {
        const cellId = `cell-${subject.id}-${studentId}`;
        const el = document.getElementById(cellId);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
        }
      }
    }
  }, [currentRow, currentCol, isEditMode, viewMode, subjects, visibleStudentIds]);

  return (
    <>
      <style jsx global>{`
        /* Keyboard Navigation Highlights */
        ${subjects.map(s => `
          .grid-container[data-active-subject="${s.id}"] .cell-subject-${s.id}::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: rgba(237, 171, 48, 0.15) !important;
            pointer-events: none;
            z-index: 5;
          }
        `).join('\n')}
        
        ${students.map(s => `
          .grid-container[data-active-student="${s.id}"] .cell-student-${s.id}::after {
            content: '';
            position: absolute;
            inset: 0;
            background-color: ${getVibrantColor(s.firstName + ' ' + s.secondName)}26 !important;
            pointer-events: none;
            z-index: 6;
          }
        `).join('\n')}

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
          tabIndex={0}
          className={`h-[22px] px-6 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all duration-300 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245] ${activeView === 'task' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          style={{ backgroundColor: '#edab30' }}>
          Task
        </button>
        <button
          onClick={() => setActiveView('query')}
          tabIndex={0}
          className={`h-[22px] px-6 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all duration-300 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245] ${activeView === 'query' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
          style={{ backgroundColor: '#edab30' }}>
          Query
        </button>

        {/* Separator */}
        <div className="h-[22px] w-px bg-white/20 mx-2 hidden md:block"></div>

        {/* View Mode Toggle */}
        <div className="flex items-center mr-2">
          <button
            onClick={() => setViewMode('grid')}
            tabIndex={0}
            className={`h-[22px] px-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ease-in-out shadow-sm rounded-l border border-r-0 border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245] ${viewMode === 'grid' ? 'bg-[#edab30] text-white opacity-100' : 'bg-[#254245] text-[#edab30] border-[#edab30] hover:bg-[#edab30]/20'}`}
          >
            <i className="fa-solid fa-table-cells mr-1"></i> Grid
          </button>
          <button
            onClick={() => setViewMode('stacked')}
            tabIndex={0}
            className={`h-[22px] px-3 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ease-in-out shadow-sm rounded-r border border-l-0 border-transparent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245] ${viewMode === 'stacked' ? 'bg-[#edab30] text-white opacity-100' : 'bg-[#254245] text-[#edab30] border-[#edab30] hover:bg-[#edab30]/20'}`}
          >
            <i className="fa-solid fa-layer-group mr-1"></i> Stacked
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 flex-wrap text-[10px] md:text-xs text-white">
          <div
            className="relative inline-block"
            ref={filterStatusRef}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsFilterStatusOpen(false);
              }
            }}
          >
            <button
              onClick={() => setIsFilterStatusOpen(!isFilterStatusOpen)}
              onFocus={(e) => { if (e.target.matches(':focus-visible')) setIsFilterStatusOpen(true); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFilterStatusOpen(true);
                  setTimeout(() => {
                    const firstBtn = filterStatusRef.current?.querySelector('.dropdown-item') as HTMLElement;
                    if (firstBtn) firstBtn.focus();
                  }, 50);
                }
              }}
              tabIndex={0}
              className="h-[22px] px-3 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white rounded-none bg-[#edab30] border-none outline-none cursor-pointer hover:opacity-90 transition-all shadow-sm flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245]"
            >
              <span>Status: {boardFilters.status === '' ? 'All' : (boardFilters.status === 'IN_PROGRESS' ? 'In Progress' : boardFilters.status)}</span>
              <i className={`fa-solid fa-chevron-${isFilterStatusOpen ? 'up' : 'down'} text-[10px]`}></i>
            </button>
            {isFilterStatusOpen && (
              <div className="absolute top-full mt-2 left-0 w-40 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] flex flex-col overflow-hidden py-1">
                {[
                  { value: '', label: 'All' },
                  { value: 'OPEN', label: 'Open' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'DONE', label: 'Done' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setBoardFilters(prev => ({ ...prev, status: opt.value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        e.stopPropagation();
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        if (next) next.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                        const prev = e.currentTarget.previousElementSibling as HTMLElement;
                        if (prev) prev.focus();
                        else {
                          const mainBtn = filterStatusRef.current?.querySelector('button') as HTMLElement;
                          if (mainBtn) mainBtn.focus();
                        }
                      }
                    }}
                    className={`dropdown-item flex items-center justify-between w-full text-left px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:bg-gray-100 focus:text-[#edab30] hover:bg-gray-50
                      ${boardFilters.status === opt.value ? 'text-[#edab30]' : 'text-gray-500 hover:text-gray-700'}`}
                    tabIndex={-1}
                  >
                    <span>{opt.label}</span>
                    {boardFilters.status === opt.value && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative inline-block"
            ref={filterTypeRef}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsFilterTypeOpen(false);
              }
            }}
          >
            <button
              onClick={() => setIsFilterTypeOpen(!isFilterTypeOpen)}
              onFocus={(e) => { if (e.target.matches(':focus-visible')) setIsFilterTypeOpen(true); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFilterTypeOpen(true);
                  setTimeout(() => {
                    const firstBtn = filterTypeRef.current?.querySelector('.dropdown-item') as HTMLElement;
                    if (firstBtn) firstBtn.focus();
                  }, 50);
                }
              }}
              tabIndex={0}
              className="h-[22px] px-3 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white rounded-none bg-[#edab30] border-none outline-none cursor-pointer hover:opacity-90 transition-all shadow-sm flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245]"
            >
              <span>Type: {boardFilters.taskType === '' ? 'All' : boardFilters.taskType}</span>
              <i className={`fa-solid fa-chevron-${isFilterTypeOpen ? 'up' : 'down'} text-[10px]`}></i>
            </button>
            {isFilterTypeOpen && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] flex flex-col overflow-hidden py-1">
                {['', 'Home Work', 'Class Work', 'Tuition Work', 'Test', 'Project'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setBoardFilters(prev => ({ ...prev, taskType: opt }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        e.stopPropagation();
                        const next = e.currentTarget.nextElementSibling as HTMLElement;
                        if (next) next.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                        const prev = e.currentTarget.previousElementSibling as HTMLElement;
                        if (prev) prev.focus();
                        else {
                          const mainBtn = filterTypeRef.current?.querySelector('button') as HTMLElement;
                          if (mainBtn) mainBtn.focus();
                        }
                      }
                    }}
                    className={`dropdown-item flex items-center justify-between w-full text-left px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:bg-gray-100 focus:text-[#edab30] hover:bg-gray-50
                      ${boardFilters.taskType === opt ? 'text-[#edab30]' : 'text-gray-500 hover:text-gray-700'}`}
                    tabIndex={-1}
                  >
                    <span>{opt === '' ? 'All' : opt}</span>
                    {boardFilters.taskType === opt && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsBatchMode(!isBatchMode);
                if (isBatchMode) setSelectedTaskIds([]);
              }
            }}
            className="flex items-center space-x-1 cursor-pointer bg-[#edab30]/20 hover:bg-[#edab30]/40 px-2 py-0.5 rounded border border-[#edab30]/50 transition-colors ml-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245]">
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
        <div className="relative ml-auto" ref={datePickerRef}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsDatePickerOpen(false);
            }
          }}>
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            onFocus={(e) => { if (e.target.matches(':focus-visible')) setIsDatePickerOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                setIsDatePickerOpen(true);
                setTimeout(() => {
                  const current = datePickerRef.current?.querySelector('.current-date-btn') || datePickerRef.current?.querySelector('.date-focus-item');
                  if (current) (current as HTMLElement).focus();
                }, 50);
              }
            }}
            tabIndex={0}
            className="h-[22px] px-4 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm opacity-100 hover:opacity-90 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245]"
            style={{ backgroundColor: '#edab30' }}>
            <span>{formattedDate || '...'}</span>
            <i className={`fa-solid fa-chevron-${isDatePickerOpen ? 'up' : 'down'} text-[10px]`}></i>
          </button>

          {isDatePickerOpen && (
            <div className="absolute top-full mt-2 left-0 w-64 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-700"
                onKeyDown={(e) => {
                  if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const items = Array.from(datePickerRef.current?.querySelectorAll('.date-focus-item') || []) as HTMLElement[];
                    const idx = items.indexOf(document.activeElement as HTMLElement);
                    let next = 0;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = idx >= 0 ? (idx + 1) % items.length : 0;
                    else next = idx > 0 ? idx - 1 : items.length - 1;
                    if (items[next]) items[next].focus();
                  }
                }}>
                <button tabIndex={-1} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="date-focus-item w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#edab30]"><i className="fa-solid fa-chevron-left"></i></button>
                <span>
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button tabIndex={-1} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="date-focus-item w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#edab30]"><i className="fa-solid fa-chevron-right"></i></button>
              </div>
              {/* Calendar Grid */}
              <div className="p-3"
                onKeyDown={(e) => {
                  if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const items = Array.from(datePickerRef.current?.querySelectorAll('.date-focus-item') || []) as HTMLElement[];
                    const idx = items.indexOf(document.activeElement as HTMLElement);
                    let next = 0;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = idx >= 0 ? (idx + 1) % items.length : 0;
                    else next = idx > 0 ? idx - 1 : items.length - 1;
                    if (items[next]) items[next].focus();
                  }
                }}>
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
                        }}
                        tabIndex={-1}
                        className={`date-focus-item w-7 h-7 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#254245] focus:ring-offset-1 ${isSelected ? 'current-date-btn bg-[#edab30] text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
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

        <div className="relative" ref={studentPickerRef}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setIsStudentPickerOpen(false);
            }
          }}>
          <button
            onClick={() => setIsStudentPickerOpen(!isStudentPickerOpen)}
            onFocus={(e) => { if (e.target.matches(':focus-visible')) setIsStudentPickerOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                setIsStudentPickerOpen(true);
                setTimeout(() => {
                  const current = studentPickerRef.current?.querySelector('.student-focus-item');
                  if (current) (current as HTMLElement).focus();
                }, 50);
              }
            }}
            tabIndex={0}
            className="h-[22px] px-4 text-xs font-bold uppercase tracking-wider text-white rounded-none transition-all shadow-sm opacity-100 hover:opacity-90 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-[#254245]"
            style={{ backgroundColor: '#edab30' }}>
            <span>Students</span>
            <i className={`fa-solid fa-chevron-${isStudentPickerOpen ? 'up' : 'down'} text-[10px]`}></i>
          </button>

          {isStudentPickerOpen && (
            <div className="absolute top-full mt-2 left-0 w-80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded border border-gray-200 z-[100] max-h-[85vh] flex flex-col">

              {/* Category Tabs */}
              <div className="flex bg-gray-50 border-b border-gray-200 rounded-t overflow-hidden"
                onKeyDown={(e) => {
                  if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const items = Array.from(studentPickerRef.current?.querySelectorAll('.student-focus-item') || []) as HTMLElement[];
                    const idx = items.indexOf(document.activeElement as HTMLElement);
                    let next = 0;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = idx >= 0 ? (idx + 1) % items.length : 0;
                    else next = idx > 0 ? idx - 1 : items.length - 1;
                    if (items[next]) items[next].focus();
                  }
                }}>
                {['All', 'Olevels', 'Matric', 'Junior'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setStudentCategoryFilter(cat as any);
                      const newVisibleStudents = students.filter(s => cat === 'All' || getStudentCategory(s.className || '') === cat);
                      setSelectedStudentIds(newVisibleStudents.map(s => s.id));
                    }}
                    tabIndex={-1}
                    className={`student-focus-item flex-1 py-2 px-1 text-[9px] font-bold uppercase tracking-wider transition-colors border-r last:border-r-0 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#edab30] focus:ring-inset ${studentCategoryFilter === cat ? 'bg-[#edab30] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="py-2 px-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center"
                onKeyDown={(e) => {
                  if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const items = Array.from(studentPickerRef.current?.querySelectorAll('.student-focus-item') || []) as HTMLElement[];
                    const idx = items.indexOf(document.activeElement as HTMLElement);
                    let next = 0;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = idx >= 0 ? (idx + 1) % items.length : 0;
                    else next = idx > 0 ? idx - 1 : items.length - 1;
                    if (items[next]) items[next].focus();
                  }
                }}>
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
                  className="student-focus-item text-[10px] text-[#254245] hover:underline font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#edab30] rounded"
                  tabIndex={-1}
                >
                  {students.length > 0 && students.filter(s => studentCategoryFilter === 'All' || getStudentCategory(s.className || '') === studentCategoryFilter).every(s => selectedStudentIds.includes(s.id)) ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 p-1 space-y-0"
                onKeyDown={(e) => {
                  if (e.key.startsWith('Arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const items = Array.from(studentPickerRef.current?.querySelectorAll('.student-focus-item') || []) as HTMLElement[];
                    const idx = items.indexOf(document.activeElement as HTMLElement);
                    let next = 0;
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = idx >= 0 ? (idx + 1) % items.length : 0;
                    else next = idx > 0 ? idx - 1 : items.length - 1;
                    if (items[next]) items[next].focus();
                  }
                }}>
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
                      tabIndex={-1}
                      className="student-focus-item w-3.5 h-3.5 border-gray-300 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#edab30]"
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
        <div className="relative ml-2 flex items-center">
          <input
            ref={studentSearchInputRef}
            type="text"
            placeholder="Search student..."
            value={studentSearchQuery}
            onChange={(e) => setStudentSearchQuery(e.target.value)}
            className="h-[22px] px-2 pl-2 pr-6 w-32 md:w-40 bg-[#edab30]/20 border border-[#edab30] text-white font-bold text-[10px] md:text-xs rounded outline-none placeholder-[#edab30]/80 focus:bg-[#edab30]/30 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#edab30]/80 text-[10px] pointer-events-none flex items-center">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
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
                width: ${64 + (visibleStudentIds.length * 96)}px;
              }
              @media (min-width: 768px) {
                .responsive-table-width {
                  width: ${80 + (visibleStudentIds.length * 120)}px;
                }
              }
            `}</style>
            <div className="responsive-table-width grid-container" ref={gridContainerRef}>
              <table className="text-sm text-left border-separate border-spacing-0 table-fixed responsive-table-width mx-0 mr-auto">
                <colgroup>
                  <col className="w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px]" />
                  {students.map((student) => {
                    if (!visibleStudentIds.includes(student.id)) return null;
                    return <col key={student.id} className="w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px]" />;
                  })}
                </colgroup>
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20 shadow-sm">
                  <tr>
                    <th scope="col" className="w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px] px-2 py-4 sticky left-0 bg-gray-100 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-r border-gray-200">
                    </th>
                    {students.map((student, index) => {
                      if (!visibleStudentIds.includes(student.id)) return null;
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
                          id={`student-col-${student.id}`}
                          scope="col"
                          className={`p-0 text-center border-b border-r border-gray-200 whitespace-nowrap w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px] relative scroll-ml-16 md:scroll-ml-[80px] cell-student-${student.id}`}
                        >
                          <div
                            className={`w-full h-full px-1 py-2 md:px-4 md:py-4 cursor-pointer active:cursor-grabbing hover:bg-gray-100 group flex flex-col items-center justify-center relative
                            ${isDragged ? 'dragged-column' : ''}
                            ${showLeftIndicator ? 'drop-target-left' : ''}
                            ${showRightIndicator ? 'drop-target-right' : ''}
                            ${activeStudentIdRef.current === student.id ? 'bg-gray-100' : ''}
                          `}
                            onClick={() => updateHighlight(activeSubjectIdRef.current, activeStudentIdRef.current === student.id ? null : student.id)}
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
                        id={isGrid && subject ? `subject-row-${subject.id}` : undefined}
                        className={`
                        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                        group scroll-mt-[100px]
                      `}
                        onDragEnter={(e) => isGrid && handleSubjectDragEnter(e, index)}
                        onDragOver={(e) => { e.preventDefault(); isGrid && handleDrag(e); }}
                        onDrop={(e) => isGrid && handleSubjectDrop(e, index)}
                      >
                        <th
                          scope="row"
                          className={`w-16 min-w-[4rem] max-w-[4rem] md:w-[80px] md:min-w-[80px] md:max-w-[80px] p-0 font-medium text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-200 bg-inherit whitespace-nowrap align-middle h-24 md:h-[120px] relative ${isGrid && subject ? `cell-subject-${subject.id}` : ''}`}
                        >
                          <div
                            className={`flex items-center justify-center w-full h-full px-2
                            ${isGrid ? 'cursor-pointer active:cursor-grabbing hover:bg-gray-100' : ''}
                            ${isDragged ? 'dragged-row' : ''}
                            ${showTopIndicator ? 'drop-target-top' : ''}
                            ${showBottomIndicator ? 'drop-target-bottom' : ''}
                            ${isGrid && subject && activeSubjectIdRef.current === subject.id ? 'bg-gray-100' : ''}
                          `}
                            onClick={() => isGrid && subject && updateHighlight(activeSubjectIdRef.current === subject.id ? null : subject.id, activeStudentIdRef.current)}
                            draggable={isGrid}
                            onDragStart={(e) => isGrid && handleSubjectDragStart(e, index)}
                            onDrag={(e) => isGrid && handleDrag(e)}
                            onDragEnd={isGrid ? handleSubjectDragEnd : undefined}
                          >
                            <span className="text-center font-bold">{isGrid && subject ? (subject.code || subject.name) : ''}</span>
                          </div>
                        </th>

                        {students.map((student, studentIndex) => {
                          if (!visibleStudentIds.includes(student.id)) return null;

                          let stackedTask = null;
                          if (!isGrid) {
                            const studentData = tasksPerStudent.find(s => s.studentId === student.id);
                            stackedTask = studentData?.tasks[index];
                            // If stacked view and no task
                            if (!stackedTask) {
                              if (index === (studentData?.tasks?.length || 0)) {
                                return (
                                  <td key={`stacked-${student.id}-${index}`} className={`p-0 text-center border-none bg-transparent h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px] relative cell-student-${student.id} cell-subject-${row.id} ${activeStudentIdRef.current === student.id || activeSubjectIdRef.current === row.id ? 'cell-subject-highlight' : ''}`}>
                                    <div className="w-full h-full relative p-1.5 pb-5">
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
                              return <td key={`stacked-${student.id}-${index}`} className={`p-0 border-none bg-transparent h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px] relative cell-student-${student.id} cell-subject-${row.id} ${activeStudentIdRef.current === student.id || activeSubjectIdRef.current === row.id ? 'cell-subject-highlight' : ''}`}></td>;
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
                          const isEditModeActiveCell = isEditMode && isGrid && currentRow === index && currentCol === visibleStudentIds.indexOf(student.id);

                          return (
                            <td
                              key={cellId}
                              id={`cell-${cellId}`}
                              className={`p-0 text-center border-b border-r border-gray-200 last:border-r-0 h-24 md:h-[120px] w-24 min-w-[6rem] max-w-[6rem] md:w-[120px] md:min-w-[120px] md:max-w-[120px] relative scroll-ml-16 md:scroll-ml-[80px] scroll-mt-[100px] cell-student-${student.id} cell-subject-${isGrid && subject ? subject.id : row.id} ${(isGrid && subject && activeSubjectIdRef.current === subject.id) || activeStudentIdRef.current === student.id || (!isGrid && activeSubjectIdRef.current === row.id) ? 'cell-subject-highlight' : ''}`}
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
                              <div className="w-full h-full relative">
                                <div
                                  onClick={() => {
                                    if (isBatchMode) return;

                                    // Always toggle highlight for this column when clicking any cell
                                    updateHighlight(activeSubjectIdRef.current, activeStudentIdRef.current === student.id ? null : student.id);

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
                                        subject: subject ? subject.name : '',
                                        studentName: studentFullName,
                                        date: selectedDate ? getLocalDateString(selectedDate) : getLocalDateString(new Date())
                                      });
                                    } else {
                                      setClickedCellId(isClicked ? null : cellId);
                                    }
                                  }}

                                  className={`
                                  w-full h-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out
                                  ${isClicked ? 'overflow-visible cell-clicked' : 'overflow-hidden'}
                                ${(!isAssigned && !isDragged && !isStudentDragged) ? 'unassigned-cell' : 'bg-white grid-cell-assigned'}
                                ${isAssigned ? 'hover:bg-gray-50' : ''}
                                  ${isClicked ? `z-[60] absolute top-1/2 -translate-y-1/2 ${studentIndex === 0 ? 'left-0' : studentIndex === visibleStudentIds.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'} w-[280px] h-[210px] md:w-[340px] md:h-[220px] bg-transparent p-0` : 'z-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-none p-0'}
                                ${isDragged || isStudentDragged ? 'dragged-column dragged-row' : ''}
                                ${showLeftIndicator ? 'drop-target-left' : ''}
                                ${showRightIndicator ? 'drop-target-right' : ''}
                                ${showTopIndicator ? 'drop-target-top' : ''}
                                ${showBottomIndicator ? 'drop-target-bottom' : ''}
                                ${isEditModeActiveCell ? 'ring-4 ring-[#edab30] ring-inset z-50' : ''}
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
                                              onKeyDown={(e) => {
                                                if (e.key === 'Tab' && isClicked) {
                                                  const focusableElements = e.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                                                  if (focusableElements.length > 0) {
                                                    const firstElement = focusableElements[0] as HTMLElement;
                                                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                                                    if (e.shiftKey) {
                                                      if (document.activeElement === firstElement) {
                                                        lastElement.focus();
                                                        e.preventDefault();
                                                      }
                                                    } else {
                                                      if (document.activeElement === lastElement) {
                                                        firstElement.focus();
                                                        e.preventDefault();
                                                      }
                                                    }
                                                  }
                                                }
                                              }}
                                              className={`w-full flex flex-col justify-start items-start shadow-sm transition-all duration-300 ease-in-out ${isClicked ? 'absolute top-0 left-0 min-h-[100%] h-fit z-[100] overflow-visible rounded-lg p-4 pb-10 shadow-[0_0_30px_rgba(0,0,0,0.2)]' : 'h-full relative overflow-hidden rounded-[4px] p-1.5 pb-5'} ${selectedTaskIds.includes(item.id) ? 'ring-4 ring-[#edab30] border-transparent' : ''}`}
                                              style={
                                                isClicked
                                                  ? { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderLeft: `6px solid ${statusColor}` }
                                                  : (selectedTaskIds.includes(item.id) ? { backgroundColor: `${statusColor}15` } : { backgroundColor: `${statusColor}15`, border: `1px solid ${statusColor}40` })
                                              }
                                            >
                                              {/* Footer area line separator */}
                                              {isClicked && (
                                                <div className="absolute bottom-0 left-0 right-0 h-8 border-t border-gray-200 pointer-events-none z-[60]"></div>
                                              )}

                                              {/* Footer Content (Bottom Left, visible only when clicked) */}
                                              {isClicked && (
                                                <div className="absolute bottom-0 left-0 z-[70] flex items-center h-8 pl-[10px] pr-1.5 rounded-bl-[4px] w-[80%]">
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteInitiate(item.id); }}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all outline-none focus-visible:ring-1 focus-visible:ring-red-500 p-1 mr-2 flex-shrink-0"
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

                                              {/* Reporter Avatar (Bottom Left, only when NOT clicked) */}
                                              {!isClicked && item.reporter && (
                                                <div className="absolute bottom-[3px] left-[3px] z-[70]" title={`Reporter: ${item.reporter}`}>
                                                  <div className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-black shadow-sm" style={{ backgroundColor: getReporterColor(item.reporter) }}>
                                                    {(item.reporter || '?').charAt(0).toUpperCase()}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Badges Container (Bottom Right) */}
                                              <div
                                                className={`absolute bottom-0 right-0 flex z-[70] rounded-tl-[4px] ${isClicked ? 'overflow-visible' : 'overflow-hidden'}`}
                                                onBlur={(e) => {
                                                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    setActiveDropdown(null);
                                                  }
                                                }}
                                                onKeyDown={(e) => {
                                                  if (activeDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();

                                                    const buttons = Array.from(e.currentTarget.querySelectorAll('button'));
                                                    if (buttons.length === 0) return;

                                                    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
                                                    let nextIndex = 0;

                                                    if (e.key === 'ArrowUp') {
                                                      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % buttons.length;
                                                    } else {
                                                      nextIndex = currentIndex === -1 ? buttons.length - 1 : (currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1);
                                                    }

                                                    buttons[nextIndex].focus();
                                                  }
                                                }}
                                              >
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
                                                  id={`badge-type-${item.id}`}
                                                  tabIndex={isClicked ? 0 : -1}
                                                  className={`flex items-center justify-center text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#254245] ${isClicked ? 'w-8 h-6 text-[10px] cursor-pointer hover:opacity-90' : 'w-5 h-4 text-[8px]'}`}
                                                  style={{ backgroundColor: typeBadge.color }}
                                                  title={item.taskType}
                                                  onFocus={() => { if (isClicked) setActiveDropdown(`${item.id}-type`); }}
                                                  onClick={(e) => {
                                                    if (!isClicked) return;
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === `${item.id}-type` ? null : `${item.id}-type`);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (isClicked && (e.key === 'Enter' || e.key === ' ')) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      setActiveDropdown(activeDropdown === `${item.id}-type` ? null : `${item.id}-type`);
                                                    }
                                                  }}
                                                >
                                                  {typeBadge.initials}
                                                </div>

                                                {activeDropdown === `${item.id}-type` && isClicked && (
                                                  <div className="absolute bottom-[100%] right-8 mb-1 flex flex-col-reverse gap-1 z-[80]" onClick={(e) => e.stopPropagation()}>
                                                    {['Tuition Work', 'Class Work', 'Home Work', 'Test', 'Project']
                                                      .filter(t => t !== item.taskType)
                                                      .map(t => {
                                                        const b = getTaskTypeBadge(t);
                                                        return (
                                                          <button
                                                            key={t}
                                                            className="w-8 h-6 flex items-center justify-center text-white text-[10px] font-bold shadow-md hover:scale-110 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                            style={{ backgroundColor: b.color }}
                                                            onClick={() => {
                                                              handleUpdateTaskField(item.id, 'taskType', t);
                                                              setActiveDropdown(null);
                                                              document.getElementById(`badge-type-${item.id}`)?.focus();
                                                            }}
                                                            onKeyDown={(e) => {
                                                              if (e.key === 'Enter' || e.key === ' ') {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleUpdateTaskField(item.id, 'taskType', t);
                                                                setActiveDropdown(null);
                                                                document.getElementById(`badge-type-${item.id}`)?.focus();
                                                              }
                                                            }}
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
                                                  id={`badge-status-${item.id}`}
                                                  tabIndex={isClicked ? 0 : -1}
                                                  className={`flex items-center justify-center text-white font-bold outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#254245] ${isClicked ? 'w-8 h-6 text-[10px] cursor-pointer hover:opacity-90' : 'w-5 h-4 text-[8px]'}`}
                                                  style={{ backgroundColor: statusColor }}
                                                  title={item.status}
                                                  onFocus={() => { if (isClicked) setActiveDropdown(`${item.id}-status`); }}
                                                  onClick={(e) => {
                                                    if (!isClicked) return;
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === `${item.id}-status` ? null : `${item.id}-status`);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (isClicked && (e.key === 'Enter' || e.key === ' ')) {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      setActiveDropdown(activeDropdown === `${item.id}-status` ? null : `${item.id}-status`);
                                                    }
                                                  }}
                                                >
                                                  {getStatusInitials(item.status)}
                                                </div>

                                                {activeDropdown === `${item.id}-status` && isClicked && (
                                                  <div className="absolute bottom-[100%] right-0 mb-1 flex flex-col-reverse gap-1 z-[80]" onClick={(e) => e.stopPropagation()}>
                                                    {['OPEN', 'IN_PROGRESS', 'DONE', 'PENDING']
                                                      .filter(s => s !== item.status)
                                                      .map(s => (
                                                        <button
                                                          key={s}
                                                          className="w-8 h-6 flex items-center justify-center text-white text-[10px] font-bold shadow-md hover:scale-110 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                          style={{ backgroundColor: getStatusColor(s) }}
                                                          onClick={() => {
                                                            handleUpdateTaskField(item.id, 'status', s);
                                                            setActiveDropdown(null);
                                                            document.getElementById(`badge-status-${item.id}`)?.focus();
                                                          }}
                                                          onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                              e.preventDefault();
                                                              e.stopPropagation();
                                                              handleUpdateTaskField(item.id, 'status', s);
                                                              setActiveDropdown(null);
                                                              document.getElementById(`badge-status-${item.id}`)?.focus();
                                                            }
                                                          }}
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
                                                  const uniqueReporters = Array.from(new Set([
                                                    ...reportersList,
                                                    ...cellData.map(d => d.reporter)
                                                  ].filter(Boolean)));

                                                  return (
                                                    <div className="flex flex-col flex-1 w-full text-left mt-0 gap-[1px]" onClick={(e) => e.stopPropagation()}>
                                                      <div className="flex items-center w-full relative group">
                                                        <span className="text-sm font-black text-gray-900 mr-2">Ch:</span>
                                                        <div className="relative flex items-center group flex-1 min-w-0">
                                                          <select
                                                            value={item.chapter || ''}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              handleUpdateTaskField(item.id, 'chapter', val);
                                                              handleUpdateTaskField(item.id, 'topic', '');
                                                              handleUpdateTaskField(item.id, 'exercise', '');
                                                            }}
                                                            className="appearance-none peer text-sm font-black text-gray-900 w-full max-w-full bg-transparent hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors rounded px-1 -ml-1 pr-6 py-0.5 truncate"
                                                          >
                                                            <option value="" disabled>-</option>
                                                            {availableChapters.map(c => (
                                                              <option key={c.id} value={c.chapterTitle || c.chapterName}>{c.chapterTitle || c.chapterName}</option>
                                                            ))}
                                                          </select>
                                                          <div className="absolute right-1 opacity-0 group-hover:opacity-100 peer-focus:opacity-100 pointer-events-none transition-opacity text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center w-full mt-1 relative group">
                                                        <span className="text-sm font-bold text-gray-800 mr-2">Tp:</span>
                                                        <div className="relative flex items-center group flex-1 min-w-0">
                                                          <select
                                                            value={item.topic || ''}
                                                            onChange={(e) => {
                                                              const val = e.target.value;
                                                              handleUpdateTaskField(item.id, 'topic', val);
                                                              handleUpdateTaskField(item.id, 'exercise', '');
                                                            }}
                                                            className="appearance-none peer text-sm font-bold text-gray-800 w-full max-w-full bg-transparent hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors rounded px-1 -ml-1 pr-6 py-0.5 truncate"
                                                          >
                                                            <option value="" disabled>Topic...</option>
                                                            {uniqueTopicNames.map((tName, i) => (
                                                              <option key={i} value={tName as string}>{tName as string}</option>
                                                            ))}
                                                          </select>
                                                          <div className="absolute right-1 opacity-0 group-hover:opacity-100 peer-focus:opacity-100 pointer-events-none transition-opacity text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center w-full mt-1 relative group">
                                                        <span className="text-xs font-semibold text-gray-700 mr-2">Ex:</span>
                                                        <div className="relative flex items-center group flex-1 min-w-0">
                                                          <select
                                                            value={item.exercise || ''}
                                                            onChange={(e) => handleUpdateTaskField(item.id, 'exercise', e.target.value)}
                                                            className="appearance-none peer text-xs font-semibold text-gray-700 w-full max-w-full italic bg-transparent hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors rounded px-1 -ml-1 pr-6 py-0.5 truncate"
                                                          >
                                                            <option value="" disabled>Exercise...</option>
                                                            {uniqueExercises.map((ex, i) => (
                                                              <option key={i} value={ex as string}>{ex as string}</option>
                                                            ))}
                                                          </select>
                                                          <div className="absolute right-1 opacity-0 group-hover:opacity-100 peer-focus:opacity-100 pointer-events-none transition-opacity text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex items-start w-full mt-1.5">
                                                        <span className="text-xs font-semibold text-gray-700 mr-2 mt-1.5">Ds:</span>
                                                        <textarea
                                                          defaultValue={item.description || ''}
                                                          placeholder="Description..."
                                                          ref={(el) => {
                                                            if (el && !el.dataset.resized) {
                                                              el.dataset.resized = 'true';
                                                              setTimeout(() => {
                                                                if (el) {
                                                                  el.style.height = 'auto';
                                                                  el.style.height = `${el.scrollHeight}px`;
                                                                }
                                                              }, 10);
                                                            }
                                                          }}
                                                          onFocus={(e) => {
                                                            const target = e.currentTarget;
                                                            setTimeout(() => {
                                                              const val = target.value;
                                                              target.setSelectionRange(val.length, val.length);
                                                            }, 0);
                                                          }}
                                                          onBlur={(e) => { if (e.target.value !== (item.description || '')) handleUpdateTaskField(item.id, 'description', e.target.value) }}
                                                          onInput={(e) => {
                                                            const target = e.currentTarget;
                                                            target.style.height = 'auto';
                                                            target.style.height = `${target.scrollHeight}px`;
                                                          }}
                                                          onKeyDown={(e) => {
                                                            if (e.key === 'Escape' || e.key === 'Esc') {
                                                              if (e.currentTarget.value !== (item.description || '')) {
                                                                handleUpdateTaskField(item.id, 'description', e.currentTarget.value);
                                                              }
                                                            } else if (e.key === 'Enter') {
                                                              if (!e.shiftKey) {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const nextElement = e.currentTarget.parentElement?.nextElementSibling?.querySelector('select');
                                                                if (nextElement) {
                                                                  nextElement.focus();
                                                                } else {
                                                                  e.currentTarget.blur();
                                                                }
                                                              }
                                                            }
                                                          }}
                                                          className="text-xs text-black font-semibold w-[calc(100%+8px)] leading-relaxed text-left bg-transparent hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors resize-none min-h-[40px] whitespace-normal custom-scrollbar rounded px-2 py-1 -ml-2"
                                                        />
                                                      </div>
                                                      <div className="flex items-center w-[calc(100%+8px)] mt-auto pt-1 relative group mb-1 hover:bg-gray-100 focus-within:bg-gray-100 rounded px-2 py-1 -ml-2 transition-colors cursor-pointer">
                                                        {(() => {
                                                          const reporterInitials = (item.reporter || '?').charAt(0).toUpperCase();
                                                          return (
                                                            <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[11px] font-bold mr-2 flex-shrink-0 shadow-sm pointer-events-none" style={{ backgroundColor: getReporterColor(item.reporter) }}>
                                                              {reporterInitials}
                                                            </div>
                                                          );
                                                        })()}
                                                        <div className="relative flex items-center group flex-1 min-w-0">
                                                          <select
                                                            value={item.reporter || ''}
                                                            onChange={(e) => handleUpdateTaskField(item.id, 'reporter', e.target.value)}
                                                            className="appearance-none peer text-[12px] font-semibold text-gray-800 w-full max-w-full bg-transparent focus:outline-none transition-colors cursor-pointer truncate pr-6 py-0.5"
                                                          >
                                                            <option value="" disabled>Reporter...</option>
                                                            {uniqueReporters.map((rp, i) => (
                                                              <option key={i} value={rp as string}>{rp as string}</option>
                                                            ))}
                                                          </select>
                                                          <div className="absolute right-[-4px] opacity-0 group-hover:opacity-100 peer-focus:opacity-100 pointer-events-none transition-opacity text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                })()
                                              ) : (
                                                <div className="flex flex-col flex-1 w-full text-left mt-0 overflow-hidden pr-2">
                                                  <span className="text-[12px] font-black text-gray-900 truncate w-full leading-tight mb-[1px]">Ch: {item.chapter || '-'}</span>
                                                  <span className="text-[10px] font-bold text-gray-800 truncate w-full leading-tight mb-[1px]">Tp: {item.topic || '-'}</span>
                                                  {item.exercise && <span className="text-[9px] font-semibold text-gray-700 truncate w-full italic leading-tight mb-[1px]">Ex: {item.exercise}</span>}

                                                  {item.description && <span className="text-[8px] text-black font-semibold mt-0.5 w-full leading-tight text-left line-clamp-2">Ds: {item.description}</span>}
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
