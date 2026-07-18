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
    <div className="pt-[50px] px-4 sm:px-6 pb-6 w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 border-b border-gray-200 pb-2">
        <div 
          className="flex gap-2 flex-wrap"
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
            // Hide tabs based on role if necessary, though Owner sees all
            if (currentUserRole === 'TEACHER' && tab !== 'STUDENT') return null;
            
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                role="tab"
                aria-selected={roleTab === tab}
                tabIndex={roleTab === tab ? 0 : -1}
                onClick={() => setRoleTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[10px] outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-t ${roleTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}s
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-4 items-center pb-1 w-full sm:w-auto justify-between sm:justify-end">
          {records.some(r => r.isLocked) && !forceEditOld && isOwnerOrCoord && (
            <button 
              onClick={() => setForceEditOld(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-pen mr-2"></i>Edit Record
            </button>
          )}
          <label className="cursor-pointer relative group flex items-center px-4 py-2 border border-teal-200 bg-teal-50 rounded-lg shadow-sm hover:bg-teal-100 transition-colors">
            <span className="font-semibold text-teal-800 mr-2">
              {(() => {
                const [y, m, d] = date.split('-');
                const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                return dObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
              })()}
            </span>
            <i className="fa-regular fa-calendar text-teal-600"></i>
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
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-teal-800 uppercase tracking-wider w-8 md:w-16">#</th>
                <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-teal-800 uppercase tracking-wider">Name</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-[10px] md:text-xs font-medium text-teal-800 uppercase tracking-wider">Class / Dept</th>
                <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-teal-800 uppercase tracking-wider">Status</th>
                <th className="px-2 py-2 md:px-6 md:py-3 text-left text-[10px] md:text-xs font-medium text-teal-800 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found for this role.</td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const locked = record.isLocked && !(isOwnerOrCoord && forceEditOld);
                  
                  return (
                    <tr 
                      key={record.userId} 
                      className={
                        record.status === 'ABSENT' ? 'bg-red-50/30' : 
                        record.status === 'LEAVE' ? 'bg-purple-50/30' :
                        record.status === 'LATE' ? 'bg-yellow-50/30' :
                        record.status === 'PRESENT' ? 'bg-green-50/30' : ''
                      }
                    >
                      <td className="px-2 py-3 md:px-6 md:py-4 whitespace-nowrap text-[10px] md:text-sm text-gray-500 font-medium">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-2 py-3 md:px-6 md:py-4">
                        <div className="font-medium text-gray-900 text-[11px] md:text-base">{record.name}</div>
                        <div className="md:hidden text-[9px] md:text-xs text-gray-500">{record.department}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="text-sm text-gray-500">{record.department}</div>
                      </td>
                      <td className="px-2 py-3 md:px-6 md:py-4">
                        <div 
                          className="flex flex-wrap gap-1 md:gap-2"
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
                              className={`px-1.5 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-semibold rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                                record.status === s 
                                  ? (s === 'PRESENT' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                     s === 'ABSENT' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                     s === 'LATE' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                     'bg-purple-100 text-purple-800 border border-purple-200')
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                              } ${locked || !canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-3 md:px-6 md:py-4">
                        <input 
                          type="text" 
                          placeholder={record.status === 'ABSENT' || record.status === 'LEAVE' || record.status === 'LATE' ? 'Reason...' : ''}
                          disabled={locked || !canEdit || (record.status !== 'ABSENT' && record.status !== 'LEAVE' && record.status !== 'LATE')}
                          value={record.reason}
                          onChange={e => handleReasonChange(record.userId, e.target.value)}
                          className="w-full text-[10px] md:text-sm px-1.5 py-1 md:px-3 md:py-1.5 border border-gray-300 focus:border-teal-500 rounded outline-none transition-colors bg-white disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-400"
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
        <div className="mt-6 flex justify-end gap-4">
          {showConfirmButton && (
            <button 
              onClick={handleConfirm}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
            >
              <i className="fas fa-check mr-2"></i> Confirm Attendance
            </button>
          )}
          
          <button 
            onClick={handleSave}
            disabled={isSaving || (records.every(r => r.isLocked) && !(isOwnerOrCoord && forceEditOld))}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
