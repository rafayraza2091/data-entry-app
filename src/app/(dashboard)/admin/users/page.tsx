'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
};

const ROLES = ['OWNER', 'COORDINATOR', 'TEACHER', 'ASSISTANT', 'STUDENT', 'PARENT'];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || 'Failed to update role');
      } else {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Network error while updating role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="page-container" style={{ color: '#9ca3af' }}>Loading users...</div>;
  if (error) return <div className="page-container" style={{ color: '#ef4444' }}>Error: {error}</div>;

  const groupedUsers = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#f3f4f6' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: '#ffffff', marginBottom: '0.5rem' }}>User Management</h1>
        <p style={{ color: '#9ca3af' }}>Manage access levels and roles for all registered accounts.</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {ROLES.map(role => (
          <div key={role} style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              borderBottom: '1px solid rgba(255,255,255,0.1)', 
              paddingBottom: '1rem',
              marginBottom: '1.5rem' 
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e5e7eb', margin: 0 }}>
                {role}
              </h2>
              <span style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                color: '#60a5fa', 
                padding: '0.1rem 0.6rem', 
                borderRadius: '9999px', 
                fontSize: '0.875rem', 
                fontWeight: '500' 
              }}>
                {groupedUsers[role]?.length || 0}
              </span>
            </div>
            
            {groupedUsers[role]?.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0, padding: '1rem 0' }}>No users are currently assigned to this role.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {groupedUsers[role].map(user => (
                  <div 
                    key={user.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: '#3b82f6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}>
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f9fafb', fontSize: '1.05rem' }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                          @{user.username}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {updatingId === user.id && (
                        <span style={{ fontSize: '0.875rem', color: '#3b82f6', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                          Saving...
                        </span>
                      )}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        style={{
                          padding: '0.5rem 2.5rem 0.5rem 1rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: '#1f2937',
                          color: '#f9fafb',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.7rem top 50%',
                          backgroundSize: '0.65rem auto',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 0 0 1px #3b82f6';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
