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
  const todayStr = new Date().toISOString().split('T')[0];
  const isOld = date < todayStr;
  
  let canEdit = isOwner || 
    (currentUserRole === 'COORDINATOR' && (roleTab === 'TEACHER' || roleTab === 'STUDENT')) || 
    (currentUserRole === 'TEACHER' && roleTab === 'STUDENT');

  if (isOld && !(isOwner && forceEditOld)) {
    canEdit = false;
  }

  const showConfirmButton = isOwner && records.some(r => r.isLocked && !r.isConfirmed);

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2 mt-4">
        <div className="flex gap-2">
          {['STUDENT', 'TEACHER', 'COORDINATOR'].map(tab => {
            // Hide tabs based on role if necessary, though Owner sees all
            if (currentUserRole === 'TEACHER' && tab !== 'STUDENT') return null;
            if (currentUserRole === 'COORDINATOR' && tab === 'COORDINATOR') return null;
            
            return (
              <button
                key={tab}
                onClick={() => setRoleTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[10px] ${roleTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}s
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-4 items-center pb-1">
          {isOld && isOwner && !forceEditOld && (
            <button 
              onClick={() => setForceEditOld(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-pen mr-2"></i>Edit Old Record
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider w-16">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Name / Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Reason (If Absent/Late)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found for this role.</td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const locked = record.isLocked && !isOwner;
                  
                  return (
                    <tr key={record.userId} className={record.status === 'ABSENT' ? 'bg-red-50/30' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{record.name}</div>
                        <div className="text-xs text-gray-500">{record.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {['PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(s => (
                            <button
                              key={s}
                              disabled={locked || !canEdit}
                              onClick={() => handleStatusChange(record.userId, s)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                record.status === s 
                                  ? (s === 'PRESENT' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                     s === 'ABSENT' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                     s === 'LATE' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                     'bg-purple-100 text-purple-800 border border-purple-200')
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                              } ${locked || !canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          placeholder={record.status === 'ABSENT' || record.status === 'LEAVE' || record.status === 'LATE' ? 'Reason (Required)...' : ''}
                          disabled={locked || !canEdit || (record.status !== 'ABSENT' && record.status !== 'LEAVE' && record.status !== 'LATE')}
                          value={record.reason}
                          onChange={e => handleReasonChange(record.userId, e.target.value)}
                          className="w-full text-sm px-3 py-1.5 border border-gray-300 focus:border-teal-500 rounded outline-none transition-colors bg-white disabled:bg-gray-100 disabled:border-transparent disabled:text-gray-400"
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
            disabled={isSaving || (records.every(r => r.isLocked) && !isOwner)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
