'use client';

import React, { useEffect, useState } from 'react';

type AttendanceRecord = {
  userId: number;
  name: string;
  department: string;
  attendanceId: number | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  reason: string;
  isLocked: boolean;
  isConfirmed: boolean;
  markedBy: string;
};

export default function AttendancePage() {
  const [roleTab, setRoleTab] = useState<'STUDENT' | 'TEACHER' | 'COORDINATOR'>('STUDENT');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [forceEditOld, setForceEditOld] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setCurrentUserRole(data.user.role);
          if (data.user.role === 'TEACHER') setRoleTab('STUDENT');
          else if (data.user.role === 'COORDINATOR') setRoleTab('TEACHER');
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setForceEditOld(false);
    fetchAttendance();
  }, [date, roleTab]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}&role=${roleTab}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (userId: number, newStatus: any) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, status: newStatus } : r));
  };

  const handleReasonChange = (userId: number, newReason: string) => {
    setRecords(prev => prev.map(r => r.userId === userId ? { ...r, reason: newReason } : r));
  };

  const handleSave = async () => {
    const missingReasons = records.filter(r => (r.status === 'ABSENT' || r.status === 'LEAVE' || r.status === 'LATE') && !r.reason.trim());
    if (missingReasons.length > 0) {
      alert(`Please provide a reason for the following absent/late/leave users:\n${missingReasons.map(r => r.name).join(', ')}`);
      return;
    }

    if (!window.confirm('Are you sure you want to save attendance?')) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        date,
        records: records.map(r => ({
          userId: r.userId,
          status: r.status,
          reason: r.reason
        }))
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      alert('Attendance saved successfully!');
      fetchAttendance(); // Refresh to get lock statuses
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Are you sure you want to confirm attendance for this date and role?')) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/attendance/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, role: roleTab })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to confirm');
      }

      alert('Attendance confirmed successfully!');
      fetchAttendance();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const isOwner = currentUserRole === 'OWNER';
  const isOwnerOrCoord = currentUserRole === 'OWNER' || currentUserRole === 'COORDINATOR';
  const todayStr = new Date().toISOString().split('T')[0];
  const isOld = date < todayStr;
  
  let canEdit = isOwnerOrCoord || 
    (currentUserRole === 'TEACHER' && roleTab === 'STUDENT');

  if (isOld && !(isOwnerOrCoord && forceEditOld)) {
    canEdit = false;
  }

  const showConfirmButton = isOwner && records.some(r => r.isLocked && !r.isConfirmed);

  return (
    <div className="pt-4 px-4 sm:px-6 pb-6 w-full max-w-[1600px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-[#D8D2C5] pb-3">
        <div 
          className="flex gap-1.5 flex-wrap"
          role="tablist"
          onKeyDown={(e) => {
            const tabs = ['STUDENT', 'TEACHER', 'COORDINATOR'].filter(t => {
              if (currentUserRole === 'TEACHER' && t !== 'STUDENT') return false;
              return true;
            });
            const currentIndex = tabs.indexOf(roleTab);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const next = tabs[(currentIndex + 1) % tabs.length];
              setRoleTab(next as any);
              setTimeout(() => document.getElementById(`tab-${next}`)?.focus(), 0);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
              setRoleTab(prev as any);
              setTimeout(() => document.getElementById(`tab-${prev}`)?.focus(), 0);
            }
          }}
        >
          {['STUDENT', 'TEACHER', 'COORDINATOR'].map(tab => {
            if (currentUserRole === 'TEACHER' && tab !== 'STUDENT') return null;
            
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-selected={roleTab === tab}
                tabIndex={roleTab === tab ? 0 : -1}
                onClick={() => setRoleTab(tab as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-[3px] transition-colors outline-none focus:ring-2 focus:ring-[#2463EB] ${roleTab === tab ? 'bg-[#124D45] text-white border border-[#B48632]' : 'bg-[#FFFEFA] border border-[#D8D2C5] text-[#687286] hover:bg-[#F4F1E9] hover:text-[#172238]'}`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}s
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-3 items-center w-full sm:w-auto justify-between sm:justify-end">
          {records.some(r => r.isLocked) && !forceEditOld && isOwnerOrCoord && (
            <button 
              onClick={() => setForceEditOld(true)}
              className="h-[34px] px-3.5 bg-[#FFFEFA] border border-[#D8D2C5] text-[#172238] rounded-[3px] hover:bg-[#F4F1E9] text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-pen text-[11px]"></i>
              <span>Edit Record</span>
            </button>
          )}
          <label className="cursor-pointer relative flex items-center h-[34px] px-3.5 border border-[#D8D2C5] bg-[#FFFEFA] rounded-[3px] hover:bg-[#F4F1E9] transition-colors">
            <span className="font-semibold text-xs text-[#172238] mr-2">
              {(() => {
                const [y, m, d] = date.split('-');
                const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                return dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              })()}
            </span>
            <i className="fa-regular fa-calendar text-xs text-[#687286]"></i>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-xs font-medium text-[#687286]">Loading attendance records...</div>
      ) : (
        <div className="bg-[#FFFEFA] rounded-[4px] border border-[#D8D2C5] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F4F1E9] border-b border-[#D8D2C5]">
              <tr>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-[#172238] uppercase tracking-wider w-12">#</th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-[#172238] uppercase tracking-wider">Name</th>
                <th className="hidden md:table-cell px-3 py-2.5 text-[10px] font-semibold text-[#172238] uppercase tracking-wider">Class / Dept</th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-[#172238] uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-[#172238] uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D2C5]/60 text-xs">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-[#687286]">No records found for this category.</td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const locked = record.isLocked && !(isOwnerOrCoord && forceEditOld);
                  
                  return (
                    <tr 
                      key={record.userId} 
                      className={
                        record.status === 'ABSENT' ? 'bg-[#A33B3B]/10' : 
                        record.status === 'LEAVE' ? 'bg-[#172238]/10' :
                        record.status === 'LATE' ? 'bg-[#9A6818]/10' :
                        record.status === 'PRESENT' ? 'bg-[#26705A]/10' : ''
                      }
                    >
                      <td className="px-3 py-2.5 text-[#687286] font-medium text-[11px]">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#172238] text-[12px]">{record.name}</div>
                        <div className="md:hidden text-[10px] text-[#687286]">{record.department}</div>
                      </td>
                      <td className="hidden md:table-cell px-3 py-2.5 text-[#687286]">
                        {record.department}
                      </td>
                      <td className="px-3 py-2.5">
                        <div 
                          className="flex flex-wrap gap-1"
                          role="radiogroup"
                          onKeyDown={(e) => {
                            if (locked || !canEdit) return;
                            const statuses = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];
                            const currentIndex = statuses.indexOf(record.status);
                            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                              e.preventDefault();
                              const next = statuses[(currentIndex + 1) % statuses.length];
                              handleStatusChange(record.userId, next);
                              setTimeout(() => document.getElementById(`status-${record.userId}-${next}`)?.focus(), 0);
                            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                              e.preventDefault();
                              const prev = statuses[(currentIndex - 1 + statuses.length) % statuses.length];
                              handleStatusChange(record.userId, prev);
                              setTimeout(() => document.getElementById(`status-${record.userId}-${prev}`)?.focus(), 0);
                            }
                          }}
                        >
                          {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(s => (
                            <button
                              key={s}
                              id={`status-${record.userId}-${s}`}
                              role="radio"
                              aria-checked={record.status === s}
                              tabIndex={record.status === s ? 0 : -1}
                              disabled={locked || !canEdit}
                              onClick={() => handleStatusChange(record.userId, s)}
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-[2px] transition-colors outline-none focus:ring-2 focus:ring-[#2463EB] ${
                                record.status === s 
                                  ? (s === 'PRESENT' ? 'bg-[#26705A] text-white border border-[#26705A]' : 
                                     s === 'ABSENT' ? 'bg-[#A33B3B] text-white border border-[#A33B3B]' : 
                                     s === 'LATE' ? 'bg-[#9A6818] text-white border border-[#9A6818]' : 
                                     'bg-[#172238] text-white border border-[#172238]')
                                  : 'bg-[#F4F1E9] text-[#687286] hover:bg-[#ECE7DC] border border-[#D8D2C5]'
                              } ${locked || !canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <input 
                          type="text" 
                          placeholder={record.status === 'ABSENT' || record.status === 'LEAVE' || record.status === 'LATE' ? 'Reason required...' : ''}
                          disabled={locked || !canEdit || (record.status !== 'ABSENT' && record.status !== 'LEAVE' && record.status !== 'LATE')}
                          value={record.reason}
                          onChange={e => handleReasonChange(record.userId, e.target.value)}
                          className="w-full text-xs h-[28px] px-2 border border-[#D8D2C5] focus:border-[#2463EB] rounded-[3px] outline-none bg-white text-[#172238] disabled:bg-[#F4F1E9] disabled:text-[#687286]/60"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {records.length > 0 && canEdit && (
        <div className="mt-4 flex justify-end gap-3">
          {showConfirmButton && (
            <button 
              onClick={handleConfirm}
              disabled={isSaving}
              className="h-[36px] px-4 bg-[#26705A] hover:bg-[#1A6358] text-white rounded-[3px] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <i className="fa-solid fa-check text-xs"></i>
              <span>Confirm Attendance</span>
            </button>
          )}
          
          <button 
            onClick={handleSave}
            disabled={isSaving || (records.every(r => r.isLocked) && !(isOwnerOrCoord && forceEditOld))}
            className="h-[36px] px-5 bg-[#124D45] hover:bg-[#1A6358] text-white rounded-[3px] text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Attendance</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
