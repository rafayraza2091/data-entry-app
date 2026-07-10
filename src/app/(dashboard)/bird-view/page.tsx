'use client';

import { useState, useEffect } from 'react';

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

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/bird-view');
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
        }
      } catch (error) {
        console.error('Failed to fetch bird view data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
                const isAssigned = students[draggedStudentIdx].subjects.includes(subject.name);
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
      </div>

      <div className="w-full h-full bg-white rounded-none shadow-sm border border-gray-100 border-t-4 border-t-teal-700 flex flex-col animate-fadeIn overflow-hidden">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading Grid Data...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <table className="w-full text-sm text-left border-collapse min-w-max">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th scope="col" className="w-20 min-w-[5rem] max-w-[5rem] px-2 py-4 sticky left-0 bg-gray-100 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-b border-r border-gray-200">
                  </th>
                  {students.map((student, index) => {
                    const isDragged = draggedStudentIdx === index;
                    const isHovered = hoveredStudentIdx === index && !isDragged;
                    // Determine drop indicator side
                    const showLeftIndicator = isHovered && draggedStudentIdx !== null && index < draggedStudentIdx;
                    const showRightIndicator = isHovered && draggedStudentIdx !== null && index > draggedStudentIdx;
                    
                    return (
                      <th 
                        key={student.id} 
                        scope="col" 
                        className={`
                          px-4 py-4 text-center border-b border-r border-gray-200 whitespace-nowrap min-w-[120px] 
                          cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all group
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
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                            <i className="fa-solid fa-grip-vertical"></i>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mb-2 shadow-sm">
                            {student.firstName.charAt(0)}{student.secondName.charAt(0)}
                          </div>
                          <span className="truncate max-w-[100px]" title={`${student.firstName} ${student.secondName}`}>
                            {student.firstName} {student.secondName}
                          </span>
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
                        hover:bg-gray-50 transition-all group
                        ${isDragged ? 'dragged-row' : ''}
                      `}
                      onDragEnter={(e) => handleSubjectDragEnter(e, index)}
                      onDragOver={(e) => { e.preventDefault(); handleDrag(e); }}
                      onDrop={(e) => handleSubjectDrop(e, index)}
                    >
                      <th 
                        scope="row" 
                        draggable
                        onDragStart={(e) => handleSubjectDragStart(e, index)}
                        onDrag={(e) => handleDrag(e)}
                        onDragEnd={handleSubjectDragEnd}
                        className={`
                          w-20 min-w-[5rem] max-w-[5rem] p-0 font-medium text-gray-900 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-200 bg-inherit whitespace-nowrap cursor-grab active:cursor-grabbing align-middle h-[100px]
                          ${showTopIndicator ? 'drop-target-top' : ''}
                          ${showBottomIndicator ? 'drop-target-bottom' : ''}
                        `}
                      >
                        <div className="flex items-center justify-center w-full h-full px-2">
                          <span className="text-center font-bold">{subject.code || subject.name}</span>
                        </div>
                      </th>
                      
                      {students.map((student, studentIndex) => {
                        const isAssigned = student.subjects.includes(subject.name);
                        const isStudentDragged = draggedStudentIdx === studentIndex;
                        const isStudentHovered = hoveredStudentIdx === studentIndex && !isStudentDragged;
                        const showLeftIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex < draggedStudentIdx;
                        const showRightIndicator = isStudentHovered && draggedStudentIdx !== null && studentIndex > draggedStudentIdx;
                        
                        const cellId = `${subject.id}-${student.id}`;
                        const isClicked = clickedCellId === cellId;
                        
                        return (
                          <td 
                            key={cellId} 
                            className={`
                              p-0 text-center border-b border-r border-gray-100 last:border-r-0 h-[100px]
                              ${isDragged || isStudentDragged ? 'dragged-column' : ''}
                              ${showLeftIndicator ? 'drop-target-left' : ''}
                              ${showRightIndicator ? 'drop-target-right' : ''}
                              ${showTopIndicator ? 'drop-target-top' : ''}
                              ${showBottomIndicator ? 'drop-target-bottom' : ''}
                            `}
                          >
                            <div 
                              onClick={() => isAssigned && setClickedCellId(isClicked ? null : cellId)}
                              className={`
                                w-full h-full transition-all duration-300 min-h-[100px] flex items-center justify-center
                                ${!isAssigned && !isDragged && !isStudentDragged ? 'unassigned-cell' : 'bg-white'}
                                ${isAssigned ? 'cursor-pointer' : ''}
                                ${isClicked ? 'transform scale-[2] origin-center z-[60] shadow-[0_0_30px_rgba(0,0,0,0.3)] relative' : 'transform scale-100 z-0 relative'}
                              `}
                            >
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
    </>
  );
}
