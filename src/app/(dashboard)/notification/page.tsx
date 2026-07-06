'use client';

import React, { useEffect, useState } from 'react';

type PendingUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  contactNumber: string;
  address: string;
  designation: string;
  fatherName: string | null;
  parentContact1: string | null;
  parentContact2: string | null;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
};

export default function NotificationPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<PendingUser | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch('/api/admin/pending-users');
      if (!res.ok) throw new Error('Failed to fetch pending users');
      const data = await res.json();
      setPendingUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve and create this user?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/pending-users/${id}`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Approval failed');
      }
      const data = await res.json();
      setPendingUsers(prev => prev.map(user => user.id === id ? data.user : user));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: number) => {
    if (!confirm("Are you sure you want to completely remove this registration?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/pending-users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Decline failed');
      }
      const data = await res.json();
      setPendingUsers(prev => prev.map(user => user.id === id ? data.user : user));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setProcessingId(editingUser.id);
    try {
      const res = await fetch(`/api/admin/pending-users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      if (!res.ok) throw new Error('Failed to update details');
      const data = await res.json();
      setPendingUsers(prev => prev.map(u => u.id === editingUser.id ? data.user : u));
      setEditingUser(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', color: '#f8fafc' }}>Loading pending users...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8fafc' }}>
        Notification / Approval Dashboard
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
        Review newly registered users. You can edit their information (like changing their designation/role) before approving them.
      </p>

      {error && <div className="status-message status-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Username</th>
              <th>Designation</th>
              <th>Status</th>
              <th>Resolved At</th>
              <th>Email</th>
              <th>Contact</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No pending registrations to review.
                </td>
              </tr>
            ) : (
              pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.username}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: 'rgba(255,255,255,0.1)',
                      textTransform: 'capitalize'
                    }}>
                      {user.designation}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 600,
                      background: user.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : user.status === 'DECLINED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: user.status === 'APPROVED' ? '#10b981' : user.status === 'DECLINED' ? '#ef4444' : '#f59e0b'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.resolvedAt ? new Date(user.resolvedAt).toLocaleString() : '-'}
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.contactNumber || 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setEditingUser(user)}
                        disabled={processingId === user.id || user.status !== 'PENDING'}
                        className="btn-submit"
                        style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', opacity: user.status !== 'PENDING' ? 0.5 : 1 }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleApprove(user.id)}
                        disabled={processingId === user.id || user.status !== 'PENDING'}
                        className="btn-submit"
                        style={{ padding: '0.4rem 0.8rem', background: '#10b981', opacity: user.status !== 'PENDING' ? 0.5 : 1 }} // Green
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleDecline(user.id)}
                        disabled={processingId === user.id || user.status !== 'PENDING'}
                        className="btn-submit"
                        style={{ padding: '0.4rem 0.8rem', background: '#ef4444', opacity: user.status !== 'PENDING' ? 0.5 : 1 }} // Red
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '800px', width: '100%' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#f8fafc' }}>
              Edit Registration Info
            </h2>
            
            <form onSubmit={handleSaveEdit} className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" value={editingUser.lastName} onChange={e => setEditingUser({...editingUser, lastName: e.target.value})} required />
              </div>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input type="text" className="form-input" value={editingUser.contactNumber} onChange={e => setEditingUser({...editingUser, contactNumber: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Designation / Role</label>
                <select className="form-select" value={editingUser.designation} onChange={e => setEditingUser({...editingUser, designation: e.target.value})} required>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser.designation === 'student' && (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Father's Name</label>
                    <input type="text" className="form-input" value={editingUser.fatherName || ''} onChange={e => setEditingUser({...editingUser, fatherName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Contact 1</label>
                    <input type="text" className="form-input" value={editingUser.parentContact1 || ''} onChange={e => setEditingUser({...editingUser, parentContact1: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parent Contact 2</label>
                    <input type="text" className="form-input" value={editingUser.parentContact2 || ''} onChange={e => setEditingUser({...editingUser, parentContact2: e.target.value})} />
                  </div>
                </>
              )}

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <input type="text" className="form-input" value={editingUser.address} onChange={e => setEditingUser({...editingUser, address: e.target.value})} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-submit" disabled={processingId !== null} style={{ flex: 1 }}>
                  {processingId === editingUser.id ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-submit" onClick={() => setEditingUser(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
