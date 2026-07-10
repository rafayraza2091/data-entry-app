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

  if (loading) return <div className="container mx-auto p-8 text-slate-500 text-center">Loading users...</div>;
  if (error) return <div className="container mx-auto p-8 text-red-500 text-center">Error: {error}</div>;

  const groupedUsers = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '1000px' }}>
      <div className="text-center md:text-left mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-800">User Management</h1>
        <p className="text-slate-500 text-sm md:text-base">Manage access levels and roles for all registered accounts.</p>
      </div>
      
      <div className="flex flex-col gap-8">
        {ROLES.map(role => (
          <div key={role} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-slate-700 m-0">
                {role}
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-sm font-medium">
                {groupedUsers[role]?.length || 0}
              </span>
            </div>
            
            {groupedUsers[role]?.length === 0 ? (
              <p className="text-slate-400 italic m-0 py-4 text-center md:text-left text-sm">No users are currently assigned to this role.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {groupedUsers[role].map(user => (
                  <div 
                    key={user.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors gap-4 md:gap-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        user.role === 'OWNER' ? 'bg-roleOwner' :
                        user.role === 'COORDINATOR' ? 'bg-roleCoordinator' :
                        user.role === 'TEACHER' ? 'bg-roleTeacher' :
                        user.role === 'STUDENT' ? 'bg-roleStudent' :
                        'bg-gray-500'
                      }`}>
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-base md:text-lg">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-slate-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center justify-between md:justify-end">
                      {updatingId === user.id && (
                        <span className="text-sm text-blue-500 animate-pulse">
                          Saving...
                        </span>
                      )}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="form-select block w-full md:w-auto px-4 py-2 pr-8 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>
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
    </main>
  );
}
