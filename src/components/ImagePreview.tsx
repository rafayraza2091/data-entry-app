'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import TaskComments from '@/components/TaskComments';

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (index: number) => void;
  onDeleteTaskTicket?: (taskId: number) => void;
  task?: {
    id: number;
    subject: string;
    chapter?: string;
    topic?: string;
    exercise?: string;
    description?: string;
    taskType?: string;
    status?: string;
    obtainedMarks?: number | null;
    totalMarks?: number;
    assignee?: string;
    studentName?: string;
    className?: string;
    dueDate?: string;
    reporter?: string;
    images?: string[];
    comments?: any[];
    [key: string]: any;
  } | null;
  student?: {
    firstName: string;
    secondName: string;
    className?: string;
    [key: string]: any;
  } | null;
  attendanceStatus?: 'ABSENT' | 'LEAVE' | 'PRESENT' | null;
  chaptersList?: any[];
  topicsList?: any[];
  reportersList?: string[];
  onUpdateTaskField?: (taskId: number, fieldName: string, newValue: any) => void;
  onAddAttachment?: () => void;
  currentUser?: any;
}

const getTaskTypeBadge = (type?: string) => {
  switch (type) {
    case 'Tuition Work': return { color: '#B48632' };
    case 'Class Work': return { color: '#124D45' };
    case 'Home Work': return { color: '#26705A' };
    case 'Test': return { color: '#9A6818' };
    case 'Project': return { color: '#4A5568' };
    default: return { color: '#B48632' };
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'DONE': return '#26705A';
    case 'IN_PROGRESS': return '#B48632';
    case 'PENDING': return '#9A6818';
    case 'OPEN': default: return '#124D45';
  }
};

const getReporterColor = (name?: string) => {
  if (!name) return '#687286';
  const colors = ['#B48632', '#124D45', '#26705A', '#9A6818', '#3182CE', '#D69E2E', '#805AD5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function ImagePreview({
  images,
  initialIndex = 0,
  onClose,
  onDelete,
  onDeleteTaskTicket,
  task,
  student,
  attendanceStatus,
  chaptersList = [],
  topicsList = [],
  reportersList = [],
  onUpdateTaskField,
  onAddAttachment,
  currentUser
}: ImagePreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageViewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Calculate pan bounds based on whether scaled image expands beyond viewport screen
  const getPanBounds = useCallback((targetZoom = zoom) => {
    const viewportWidth = imageViewportRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800);
    const viewportHeight = imageViewportRef.current?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600);
    const imgWidth = imageRef.current?.clientWidth || imageRef.current?.offsetWidth || 0;
    const imgHeight = imageRef.current?.clientHeight || imageRef.current?.offsetHeight || 0;

    const scaledWidth = imgWidth * targetZoom;
    const scaledHeight = imgHeight * targetZoom;

    // Scroll right/left and up/down only enable when picture expands beyond the screen!
    const canScrollHorizontally = scaledWidth > viewportWidth + 10;
    const canScrollVertically = scaledHeight > viewportHeight + 10;

    const maxPanX = canScrollHorizontally ? Math.max(0, (scaledWidth - viewportWidth) / 2) : 0;
    const maxPanY = canScrollVertically ? Math.max(0, (scaledHeight - viewportHeight) / 2) : 0;

    return {
      canScrollHorizontally,
      canScrollVertically,
      maxPanX,
      maxPanY
    };
  }, [zoom]);

  // Helper to update zoom scale (50% steps) and focus image container when zooming in
  const updateZoom = useCallback((newZoomOrFn: number | ((prev: number) => number)) => {
    setZoom((prevZoom) => {
      const nextZoom = typeof newZoomOrFn === 'function' ? newZoomOrFn(prevZoom) : newZoomOrFn;
      const clamped = Math.max(0.5, Math.min(4.0, +nextZoom.toFixed(2)));
      if (clamped > 1.0) {
        // Focus image container when zooming in
        setTimeout(() => {
          imageViewportRef.current?.focus();
        }, 10);
      } else if (clamped <= 1.0) {
        setPan({ x: 0, y: 0 });
      }
      return clamped;
    });
  }, []);

  // Active index inside Top Command Bar (Roving TabIndex)
  const [topBarFocusedIdx, setTopBarFocusedIdx] = useState(0);

  // Local task field states for instant feedback
  const [obtainedMarks, setObtainedMarks] = useState<string>(
    task?.obtainedMarks !== undefined && task?.obtainedMarks !== null ? String(task.obtainedMarks) : ''
  );
  const [description, setDescription] = useState<string>(task?.description || '');
  const [chapter, setChapter] = useState<string>(task?.chapter || '');
  const [topic, setTopic] = useState<string>(task?.topic || '');
  const [exercise, setExercise] = useState<string>(task?.exercise || '');

  useEffect(() => {
    if (task) {
      setObtainedMarks(task.obtainedMarks !== undefined && task.obtainedMarks !== null ? String(task.obtainedMarks) : '');
      setDescription(task.description || '');
      setChapter(task.chapter || '');
      setTopic(task.topic || '');
      setExercise(task.exercise || '');
    }
  }, [task?.id, task?.obtainedMarks, task?.description, task?.chapter, task?.topic, task?.exercise]);

  // Keyboard navigation & Tab focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If Delete confirmation prompt modal is active over preview, ignore key events inside preview
      if (typeof document !== 'undefined' && document.querySelector('[data-delete-modal="true"]')) {
        return;
      }

      const target = e.target as HTMLElement;
      const targetTag = target?.tagName || '';

      // Handle Tab key section traversal
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        e.preventDefault();

        const activeEl = document.activeElement as HTMLElement;
        const header = modalRef.current.querySelector('header');
        const isHeaderFocused = header?.contains(activeEl);

        const asideFocusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'aside button:not([tabindex="-1"]):not([disabled]), aside input:not([tabindex="-1"]):not([disabled]), aside select:not([tabindex="-1"]):not([disabled]), aside textarea:not([tabindex="-1"]):not([disabled]), aside [tabindex="0"]:not([disabled])'
          )
        ).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

        // If currently focused inside Top Command Bar:
        if (isHeaderFocused) {
          if (e.shiftKey) {
            // Shift+Tab -> Jump to last element in aside (Comments submit)
            if (asideFocusables.length > 0) {
              asideFocusables[asideFocusables.length - 1].focus();
            }
          } else {
            // Tab -> Jump directly to first element in aside (Chapter)
            if (asideFocusables.length > 0) {
              asideFocusables[0].focus();
            }
          }
          return;
        }

        const allFocusables = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([tabindex="-1"]):not([disabled]), input:not([tabindex="-1"]):not([disabled]), select:not([tabindex="-1"]):not([disabled]), textarea:not([tabindex="-1"]):not([disabled]), [tabindex="0"]:not([disabled])'
          )
        ).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

        if (allFocusables.length > 0) {
          const currIdx = allFocusables.indexOf(activeEl);
          if (e.shiftKey) {
            if (currIdx <= 0) {
              allFocusables[allFocusables.length - 1].focus();
            } else {
              allFocusables[currIdx - 1].focus();
            }
          } else {
            if (currIdx === -1 || currIdx >= allFocusables.length - 1) {
              allFocusables[0].focus();
            } else {
              allFocusables[currIdx + 1].focus();
            }
          }
        }
        return;
      }

      const activeEl = document.activeElement as HTMLElement | null;
      const targetEl = (e.target as HTMLElement | null) || activeEl;
      const isOptionControlFocused = Boolean(
        activeEl &&
        activeEl !== document.body &&
        modalRef.current?.contains(activeEl) &&
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(activeEl.tagName)
      );
      const isEditingText = ['INPUT', 'TEXTAREA'].includes(targetTag) || Boolean(targetEl?.isContentEditable);

      // Handle Arrow key smooth panning/scrolling when image is zoomed in (zoom > 1.0)
      if (zoom > 1.0 && !isEditingText && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const bounds = getPanBounds(zoom);
        const viewportH = imageViewportRef.current?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600);
        const viewportW = imageViewportRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800);
        const PAN_STEP_Y = Math.max(320, Math.round(viewportH * 0.5));
        const PAN_STEP_X = Math.max(320, Math.round(viewportW * 0.5));

        let handled = false;
        if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
          if (bounds.canScrollVertically) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (e.key === 'ArrowUp') {
              setPan(p => ({ ...p, y: Math.min(bounds.maxPanY, p.y + PAN_STEP_Y) }));
            } else {
              setPan(p => ({ ...p, y: Math.max(-bounds.maxPanY, p.y - PAN_STEP_Y) }));
            }
            handled = true;
          }
        }

        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
          if (bounds.canScrollHorizontally) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (e.key === 'ArrowLeft') {
              setPan(p => ({ ...p, x: Math.min(bounds.maxPanX, p.x + PAN_STEP_X) }));
            } else {
              setPan(p => ({ ...p, x: Math.max(-bounds.maxPanX, p.x - PAN_STEP_X) }));
            }
            handled = true;
          }
        }

        if (handled) return;
      }

      // Handle Delete / Backspace key when no text input is being edited -> Trigger Delete Ticket with warning & undo
      const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace' || e.code === 'Delete' || e.code === 'Backspace' || e.keyCode === 8 || e.keyCode === 46;
      if (isDeleteKey && !isEditingText) {
        if (task && onDeleteTaskTicket) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          onDeleteTaskTicket(task.id);
          return;
        }
      }

      // Handle Escape key:
      // If an option control is focused, blur element first (remove highlight). Closing modal happens on second Escape press.
      if (e.key === 'Escape') {
        if (isOptionControlFocused && activeEl) {
          e.preventDefault();
          e.stopPropagation();
          activeEl.blur();
          return;
        }
        onClose();
        return;
      }

      // When no option control is focused (isOptionControlFocused is false), Arrow keys switch attachment files (only if zoom <= 1.0)
      if (!isOptionControlFocused && zoom <= 1.0 && e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setRotation(0); setZoom(1); setPan({ x: 0, y: 0 });
      } else if (!isOptionControlFocused && zoom <= 1.0 && e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setRotation(0); setZoom(1); setPan({ x: 0, y: 0 });
      } else if (!isOptionControlFocused && e.key.toLowerCase() === 'r') {
        if (e.shiftKey) setRotation(r => r - 90);
        else setRotation(r => r + 90);
      } else if (!isOptionControlFocused && (e.key === '+' || e.key === '=')) {
        updateZoom((z: number) => z + 0.50);
      } else if (!isOptionControlFocused && e.key === '-') {
        updateZoom((z: number) => z - 0.50);
      } else if (!isOptionControlFocused && e.key === '0') {
        updateZoom(1.0); setRotation(0);
      } else if (!isOptionControlFocused && e.key === '1') {
        updateZoom(1.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.body.style.overflow = '';
    };
  }, [images.length, onClose, task, onDeleteTaskTicket, zoom, updateZoom, getPanBounds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    const bounds = getPanBounds(zoom);
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({
      x: bounds.canScrollHorizontally ? Math.max(-bounds.maxPanX, Math.min(bounds.maxPanX, newX)) : 0,
      y: bounds.canScrollVertically ? Math.max(-bounds.maxPanY, Math.min(bounds.maxPanY, newY)) : 0
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setRotation(0); setZoom(1); setPan({ x: 0, y: 0 });
      setTouchStart(null);
    }
    if (diff < -50) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setRotation(0); setZoom(1); setPan({ x: 0, y: 0 });
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!task || !onUpdateTaskField) return;
    onUpdateTaskField(task.id, fieldName, value);
  };

  // Helper for arrow key traversal within option groups
  const handleGroupArrowKeyDown = (e: React.KeyboardEvent<HTMLElement>, selector: string = 'button, [tabindex]') => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      const parent = e.currentTarget.closest('header') || e.currentTarget.parentElement;
      if (parent) {
        const items = Array.from(parent.querySelectorAll<HTMLElement>(selector));
        const idx = items.indexOf(e.currentTarget);
        if (idx !== -1) {
          items[(idx + 1) % items.length]?.focus();
        }
      }
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      const parent = e.currentTarget.closest('header') || e.currentTarget.parentElement;
      if (parent) {
        const items = Array.from(parent.querySelectorAll<HTMLElement>(selector));
        const idx = items.indexOf(e.currentTarget);
        if (idx !== -1) {
          items[(idx - 1 + items.length) % items.length]?.focus();
        }
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.click();
    }
  };

  if (!images || images.length === 0) return null;

  const studentFullName = student
    ? `${student.firstName} ${student.secondName}`.trim()
    : task?.assignee || task?.studentName || '';

  const obtainedNum = obtainedMarks !== '' ? Number(obtainedMarks) : 0;
  const totalNum = task?.totalMarks ?? 10;
  const marksPercent = totalNum > 0 ? Math.round((obtainedNum / totalNum) * 100) : 0;

  const availableChapters = chaptersList.filter(c => !task?.subject || c.subject === task.subject);
  const availableTopics = topicsList.filter(t => !task?.subject || t.subject === task.subject);
  const uniqueReporters = Array.from(new Set([
    ...reportersList,
    task?.reporter
  ])).filter(Boolean);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 flex flex-col bg-[#05080C]/90 backdrop-blur-[2px] overflow-hidden select-none"
      style={{ zIndex: 10005 }}
    >
      {/* 1. TOP COMMAND BAR (Roving TabIndex with topBarFocusedIdx) */}
      <header className="h-12 md:h-14 bg-[#0B0F17] border-b border-[#1E293B] px-3 md:px-5 flex items-center justify-between z-20 shrink-0 text-white shadow-md">
        {/* Left Header Metadata */}
        <div className="flex items-center gap-2.5 truncate max-w-[45%]">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-xs md:text-sm text-[#FFFEFA] truncate">
              {studentFullName || 'Student Attachment'}
            </span>
            {task?.subject && (
              <>
                <span className="text-gray-500 text-xs hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-[#B48632] uppercase tracking-wider truncate hidden sm:inline">
                  {task.subject}
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] md:text-xs font-bold px-2 py-0.5 bg-white/10 text-white/90 rounded border border-white/15 shrink-0">
            Attachment {currentIndex + 1} of {images.length}
          </span>
        </div>

        {/* Center & Right Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="Top Command Bar">
          {/* Rotate Left */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 0 ? 0 : -1}
            onClick={() => setRotation(r => r - 90)}
            onFocus={() => setTopBarFocusedIdx(0)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all flex items-center gap-1 focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Rotate Left (Shift + R)"
          >
            <i className="fa-solid fa-rotate-left text-[11px]"></i>
            <span className="hidden sm:inline">Rotate -90°</span>
          </button>

          {/* Rotate Right */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 1 ? 0 : -1}
            onClick={() => setRotation(r => r + 90)}
            onFocus={() => setTopBarFocusedIdx(1)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all flex items-center gap-1 focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Rotate Right (R)"
          >
            <i className="fa-solid fa-rotate-right text-[11px]"></i>
            <span className="hidden sm:inline">Rotate +90°</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-0.5"></div>

          {/* Zoom Out */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 2 ? 0 : -1}
            onClick={() => updateZoom((z: number) => z - 0.50)}
            onFocus={() => setTopBarFocusedIdx(2)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Zoom Out (-)"
          >
            <i className="fa-solid fa-magnifying-glass-minus text-[11px]"></i>
          </button>

          <span className="text-[11px] font-mono text-gray-300 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 3 ? 0 : -1}
            onClick={() => updateZoom((z: number) => z + 0.50)}
            onFocus={() => setTopBarFocusedIdx(3)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Zoom In (+)"
          >
            <i className="fa-solid fa-magnifying-glass-plus text-[11px]"></i>
          </button>

          {/* Fit */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 4 ? 0 : -1}
            onClick={() => { updateZoom(1.0); setRotation(0); }}
            onFocus={() => setTopBarFocusedIdx(4)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all hidden md:inline-flex focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Fit Screen (0)"
          >
            Fit
          </button>

          {/* Reset */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === 5 ? 0 : -1}
            onClick={() => { updateZoom(1.0); setRotation(0); }}
            onFocus={() => setTopBarFocusedIdx(5)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="px-2 py-1 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium rounded text-gray-200 hover:text-white transition-all hidden md:inline-flex focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Reset Zoom & Rotation"
          >
            Reset
          </button>

          {/* Delete Attachment Image */}
          {onDelete && (
            <button
              type="button"
              tabIndex={topBarFocusedIdx === 6 ? 0 : -1}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this attachment image?")) {
                  const targetIdx = currentIndex;
                  onDelete(targetIdx);
                  if (images.length <= 1) {
                    onClose();
                  } else {
                    setCurrentIndex((prev) => (prev >= images.length - 1 ? Math.max(0, images.length - 2) : prev));
                  }
                }
              }}
              onFocus={() => setTopBarFocusedIdx(6)}
              onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
              className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-all flex items-center gap-1 ml-1 focus:ring-2 focus:ring-red-400 focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
              title="Delete Attachment Image"
            >
              <i className="fa-solid fa-image text-[11px]"></i>
              <span className="hidden sm:inline">Delete Image</span>
            </button>
          )}

          {/* Close Button */}
          <button 
            type="button"
            tabIndex={topBarFocusedIdx === (onDelete ? 7 : 6) ? 0 : -1}
            onClick={onClose}
            onFocus={() => setTopBarFocusedIdx(onDelete ? 7 : 6)}
            onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
            className="ml-2 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all text-xl font-bold focus:ring-2 focus:ring-[#B48632] focus:ring-offset-1 focus:ring-offset-[#0B0F17] focus:outline-none"
            title="Close Preview (Esc)"
          >
            &times;
          </button>
        </div>
      </header>

      {/* 2. BODY WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAIN CANVAS */}
        <div 
          ref={imageViewportRef}
          tabIndex={-1}
          className="flex-1 bg-[#080B10] flex items-center justify-center relative overflow-hidden cursor-grab active:cursor-grabbing outline-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                type="button"
                tabIndex={-1}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white text-2xl flex items-center justify-center border border-white/20 transition-all shadow-lg focus:ring-2 focus:ring-[#B48632] focus:outline-none"
                onClick={() => {
                  setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
                  setRotation(0); updateZoom(1); setPan({ x: 0, y: 0 });
                }}
              >
                &#8249;
              </button>
              <button 
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white text-2xl flex items-center justify-center border border-white/20 transition-all shadow-lg focus:ring-2 focus:ring-[#B48632] focus:outline-none"
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % images.length);
                  setRotation(0); updateZoom(1); setPan({ x: 0, y: 0 });
                }}
              >
                &#8250;
              </button>
            </>
          )}

          {/* Active Canvas Badges */}
          <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
            {rotation % 360 !== 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#B48632] text-white rounded shadow-sm">
                Rotated {((rotation % 360) + 360) % 360}°
              </span>
            )}
            {zoom !== 1 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-600 text-white rounded shadow-sm">
                Zoom {Math.round(zoom * 100)}%
              </span>
            )}
          </div>

          {/* Image display with CSS transform */}
          <div 
            className={`flex items-center justify-center max-w-full max-h-full p-4 ${
              isPanning ? 'transition-none' : 'transition-transform duration-150 ease-out'
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
            }}
            onDoubleClick={() => {
              if (zoom <= 1) updateZoom(1.5);
              else updateZoom(1.0);
            }}
          >
            <img 
              ref={imageRef}
              src={images[currentIndex]} 
              alt={`Attachment ${currentIndex + 1}`} 
              className="max-w-[85vw] max-h-[75vh] object-contain shadow-2xl rounded-[2px]"
              draggable={false}
            />
          </div>

          {/* Bottom Thumbnail Navigation Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-xl">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setRotation(0); setZoom(1); setPan({ x: 0, y: 0 });
                  }}
                  className={`relative rounded overflow-hidden transition-all border-2 focus:ring-2 focus:ring-[#B48632] focus:outline-none ${idx === currentIndex ? 'border-[#B48632] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-10 h-10 object-cover" />
                  <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] px-1 font-bold">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. RIGHT TASK REVIEW PANEL (Matches Main Card Options Exactly) */}
        {task && (
          <aside className="hidden md:flex flex-col w-[420px] bg-[#FFFEFA] border-l border-[#D8D2C5] h-full overflow-y-auto custom-scrollbar shrink-0 text-[#172238]">
            {/* Header (Breadcrumb + Student Name) */}
            <div className="p-4 border-b border-[#E2DDD3] bg-[#FFFEFA]">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-[#687286] flex items-center gap-1.5 truncate">
                  <span>{task.subject}</span>
                  {(task.chapter || task.topic) && (
                    <>
                      <span className="text-[#D8D2C5]">&gt;</span>
                      <span className="truncate">{task.topic || task.chapter}</span>
                    </>
                  )}
                </div>
                {attendanceStatus && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    attendanceStatus === 'ABSENT' ? 'bg-red-100 text-red-700 border-red-300' :
                    attendanceStatus === 'LEAVE' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                    'bg-green-100 text-green-700 border-green-300'
                  }`}>
                    {attendanceStatus}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#172238] tracking-tight truncate">
                {studentFullName || 'Student Assignment'}
              </h2>
            </div>

            {/* ASSIGNMENT DETAILS (3-Column Grid for Chapter, Topic, Exercise + Description) */}
            <div className="p-4 border-b border-[#E2DDD3] space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-[#172238] font-bold">ASSIGNMENT DETAILS</h3>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Chapter */}
                <div>
                  <label className="text-[11px] font-medium text-[#687286] block mb-1">Chapter</label>
                  {availableChapters.length > 0 ? (
                    <select
                      tabIndex={0}
                      value={chapter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setChapter(val);
                        handleFieldChange('chapter', val);
                      }}
                      className="w-full h-9 text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] hover:border-[#124D45] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded px-2 outline-none truncate"
                    >
                      <option value="">Select chapter...</option>
                      {availableChapters.map((c: any) => {
                        const title = c.chapterTitle || c.chapterName || c;
                        return <option key={c.id || title} value={title}>{title}</option>;
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      tabIndex={0}
                      value={chapter}
                      onChange={(e) => {
                        setChapter(e.target.value);
                        handleFieldChange('chapter', e.target.value);
                      }}
                      placeholder="Chapter..."
                      className="w-full h-9 text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded px-2 outline-none"
                    />
                  )}
                </div>

                {/* Topic */}
                <div>
                  <label className="text-[11px] font-medium text-[#687286] block mb-1">Topic</label>
                  {availableTopics.length > 0 ? (
                    <select
                      tabIndex={0}
                      value={topic}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTopic(val);
                        handleFieldChange('topic', val);
                      }}
                      className="w-full h-9 text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] hover:border-[#124D45] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded px-2 outline-none truncate"
                    >
                      <option value="">Select topic...</option>
                      {availableTopics.map((t: any) => {
                        const name = t.topicName || t;
                        return <option key={t.id || name} value={name}>{name}</option>;
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      tabIndex={0}
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value);
                        handleFieldChange('topic', e.target.value);
                      }}
                      placeholder="Topic..."
                      className="w-full h-9 text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded px-2 outline-none"
                    />
                  )}
                </div>

                {/* Exercise */}
                <div>
                  <label className="text-[11px] font-medium text-[#687286] block mb-1">Exercise</label>
                  <input
                    type="text"
                    tabIndex={0}
                    value={exercise}
                    onChange={(e) => {
                      setExercise(e.target.value);
                      handleFieldChange('exercise', e.target.value);
                    }}
                    placeholder="Exercise..."
                    className="w-full h-9 text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] hover:border-[#124D45] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded px-2 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-medium text-[#687286] block mb-1">Description</label>
                <textarea
                  tabIndex={0}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    handleFieldChange('description', e.target.value);
                  }}
                  placeholder="Task description..."
                  className="w-full text-xs text-[#172238] font-medium bg-white border border-[#E2DDD3] hover:border-[#124D45] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded p-2.5 min-h-[64px] outline-none leading-relaxed resize-y custom-scrollbar"
                />
              </div>
            </div>

            {/* GRADING (Score + Green Progress Bar) */}
            <div className="p-4 border-b border-[#E2DDD3] space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-[#172238] font-bold">GRADING</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  tabIndex={0}
                  min={0}
                  max={totalNum}
                  value={obtainedMarks}
                  onChange={(e) => {
                    setObtainedMarks(e.target.value);
                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                    handleFieldChange('obtainedMarks', val);
                  }}
                  placeholder="-"
                  className="w-16 h-10 text-center text-2xl font-bold text-[#172238] bg-white border border-[#E2DDD3] focus:border-[#124D45] focus:ring-2 focus:ring-[#124D45] focus:outline-none transition-all rounded outline-none"
                />
                <span className="text-base font-normal text-[#999999]">/ {totalNum}</span>
                <span className="text-xs font-medium text-[#687286] ml-auto">{marksPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#FAF8F5] border border-[#E2DDD3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#124D45] transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, marksPercent))}%` }}
                />
              </div>

              {/* Task Type Pills (Roving TabIndex & Arrow Traversal) */}
              <div className="pt-2">
                <label className="text-[11px] font-medium text-[#687286] block mb-1.5">Task Type</label>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Task Type">
                  {['Tuition Work', 'Class Work', 'Home Work', 'Test', 'Project'].map((t, tIdx, tArr) => {
                    const isSelected = task.taskType === t;
                    const isDefaultFocused = isSelected || (!task.taskType || !tArr.includes(task.taskType)) && tIdx === 0;
                    const b = getTaskTypeBadge(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        tabIndex={isDefaultFocused ? 0 : -1}
                        onClick={() => handleFieldChange('taskType', t)}
                        onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
                        className={`h-8 px-3 border rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-[#124D45] focus:ring-offset-1 focus:scale-105 z-10 ${
                          isSelected
                            ? 'text-white border-transparent font-semibold shadow-xs'
                            : 'bg-white text-[#687286] border-[#E2DDD3] hover:border-[#124D45] hover:text-[#172238]'
                        }`}
                        style={{ backgroundColor: isSelected ? b.color : undefined }}
                      >
                        {isSelected && <span className="font-bold">✓</span>}
                        <span>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Pills (Roving TabIndex & Arrow Traversal) */}
              <div className="pt-1">
                <label className="text-[11px] font-medium text-[#687286] block mb-1.5">Status</label>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Status">
                  {['OPEN', 'IN_PROGRESS', 'DONE', 'PENDING'].map((s, sIdx, sArr) => {
                    const isSelected = task.status === s;
                    const isDefaultFocused = isSelected || (!task.status || !sArr.includes(task.status)) && sIdx === 0;
                    const color = getStatusColor(s);
                    const label = s === 'IN_PROGRESS' ? 'In Progress' : (s.charAt(0) + s.slice(1).toLowerCase());
                    return (
                      <button
                        key={s}
                        type="button"
                        tabIndex={isDefaultFocused ? 0 : -1}
                        onClick={() => handleFieldChange('status', s)}
                        onKeyDown={(e) => handleGroupArrowKeyDown(e, 'button')}
                        className={`h-8 px-3 border rounded text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-[#124D45] focus:ring-offset-1 focus:scale-105 z-10 ${
                          isSelected
                            ? 'text-white border-transparent font-semibold shadow-xs'
                            : 'bg-white text-[#687286] border-[#E2DDD3] hover:border-[#124D45] hover:text-[#172238]'
                        }`}
                        style={{ backgroundColor: isSelected ? color : undefined }}
                      >
                        {isSelected && <span className="font-bold">✓</span>}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reporter Dropdown */}
              <div className="pt-2">
                <label className="text-[11px] font-medium text-[#687286] block mb-1.5">Reporter</label>
                <div className="flex items-center gap-2.5 h-10 px-3 border border-[#E2DDD3] hover:border-[#124D45] focus-within:border-[#124D45] focus-within:ring-2 focus-within:ring-[#124D45] rounded bg-white transition-all">
                  <div
                    className="w-6 h-6 rounded text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: getReporterColor(task.reporter) }}
                  >
                    {(task.reporter || '?').charAt(0).toUpperCase()}
                  </div>
                  <select
                    tabIndex={0}
                    value={task.reporter || ''}
                    onChange={(e) => handleFieldChange('reporter', e.target.value)}
                    className="text-xs font-semibold text-[#172238] bg-transparent outline-none flex-1 cursor-pointer"
                  >
                    {uniqueReporters.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attachments Section (Roving TabIndex & Focus Highlighting) */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#172238]">Attachments</span>
                    <span className="text-xs font-bold text-[#124D45] bg-[#124D45]/10 px-2 py-0.5 rounded border border-[#124D45]/20">
                      {images ? images.length : 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                  {images && images.map((img: string, iIdx: number) => (
                    <div
                      key={iIdx}
                      tabIndex={iIdx === 0 ? 0 : -1}
                      className={`relative w-14 h-14 rounded border-2 overflow-hidden cursor-pointer group shrink-0 transition-all focus:ring-2 focus:ring-[#124D45] focus:ring-offset-1 focus:outline-none ${
                        iIdx === currentIndex ? 'border-[#124D45] ring-2 ring-[#124D45]/30' : 'border-[#E2DDD3] hover:border-[#124D45]'
                      }`}
                      onClick={() => setCurrentIndex(iIdx)}
                      onKeyDown={(e) => {
                        if (['Enter', ' '].includes(e.key)) {
                          e.preventDefault();
                          setCurrentIndex(iIdx);
                        } else {
                          handleGroupArrowKeyDown(e, '[tabindex]');
                        }
                      }}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {onDelete && (
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Delete this image?")) onDelete(iIdx);
                          }}
                          className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}

                  {onAddAttachment && (
                    <button
                      type="button"
                      tabIndex={!images || images.length === 0 ? 0 : -1}
                      onClick={onAddAttachment}
                      onKeyDown={(e) => handleGroupArrowKeyDown(e, '[tabindex]')}
                      className="w-14 h-14 rounded border-2 border-dashed border-[#D8D2C5] hover:border-[#124D45] hover:bg-[#124D45]/5 flex flex-col items-center justify-center gap-0.5 text-[#687286] hover:text-[#124D45] transition-all shrink-0 focus:ring-2 focus:ring-[#124D45] focus:ring-offset-1 focus:outline-none"
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                      <span className="text-[9px] font-bold uppercase">ADD</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIVITY & COMMENTS */}
            <div className="p-4 flex-1">
              <TaskComments 
                taskId={task.id} 
                initialComments={task.comments || []}
                currentUser={currentUser}
                onCommentsChange={(updated) => {
                  if (onUpdateTaskField) onUpdateTaskField(task.id, 'comments', updated);
                }}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
