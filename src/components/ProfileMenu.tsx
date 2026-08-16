'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllClientCache } from '@/lib/client-cache';

const getVibrantColor = (str: string) => {
  const colors = [
    '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
    '#f032e6', '#469990', '#9a6324', '#800000', '#808000',
    '#000075', '#D81B60', '#3949AB', '#2E7D32', '#D84315', '#00838F'
  ];
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ProfileMenu({ firstName: initialFirstName, role }: { firstName: string, role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName || '');
  const [editFirstName, setEditFirstName] = useState(initialFirstName || '');
  const [editLastName, setEditLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setFirstName(initialFirstName || '');
    setEditFirstName(initialFirstName || '');
  }, [initialFirstName]);

  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    try {
      clearAllClientCache();
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
      clearAllClientCache();
      window.location.href = '/login';
    }
  };

  const handleOpenEditModal = async () => {
    setIsOpen(false);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setEditFirstName(data.user.firstName || '');
          setEditLastName(data.user.lastName || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch user details', err);
    }
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFirstName.trim()) {
      setErrorMsg('First name is required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update profile.');
        setIsLoading(false);
        return;
      }

      setFirstName(data.user.firstName);
      setIsEditModalOpen(false);
      setIsLoading(false);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsOpen(false);
        setIsEditModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const studentStyle = role === 'STUDENT' ? { backgroundColor: getVibrantColor(firstName) } : undefined;

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button 
          type="button"
          className="w-8 h-8 rounded-full bg-[#124D45] text-white flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors hover:ring-2 hover:ring-[#B48632] outline-none focus:ring-2 focus:ring-[#2463EB]" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="User menu"
          style={{ ...studentStyle, pointerEvents: 'auto' }}
        >
          {initial}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#FFFEFA] border border-[#D8D2C5] rounded-[6px] shadow-[0_4px_14px_rgba(23,34,56,0.12)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-120">
            <div className="p-3 border-b border-[#D8D2C5]/60 flex flex-col gap-0.5">
              <p className="text-xs font-semibold text-[#172238] truncate">Hi, {firstName || 'User'}!</p>
              {role && (
                <span className="text-[10px] font-semibold text-[#687286] uppercase tracking-wider">
                  {role}
                </span>
              )}
            </div>

            {/* Only Owner can edit their name */}
            {role === 'OWNER' && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-[#172238] hover:bg-[#F4F1E9] text-xs font-medium transition-colors flex items-center gap-2 border-b border-[#D8D2C5]/40 outline-none focus:bg-[#F4F1E9]"
                onClick={handleOpenEditModal}
              >
                <i className="fa-solid fa-user-pen text-[11px] text-[#B48632]"></i>
                <span>Edit Name</span>
              </button>
            )}

            <button 
              type="button"
              className="w-full text-left px-3 py-2.5 text-[#A33B3B] hover:bg-[#A33B3B]/10 text-xs font-medium transition-colors flex items-center gap-2 outline-none focus:bg-[#A33B3B]/10" 
              onClick={handleLogout}
              style={{ pointerEvents: 'auto' }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-[11px]"></i>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal for Owner */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#0F181B]/48 backdrop-blur-[1px] z-[9000] flex items-center justify-center p-4">
          <div className="bg-[#FFFEFA] border border-[#D8D2C5] rounded-[8px] shadow-[0_8px_30px_rgba(0,0,0,0.18)] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-[#D8D2C5] bg-[#F9F7F1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-gear text-sm text-[#B48632]"></i>
                <h2 className="text-sm font-semibold text-[#172238]">Edit Owner Name</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#687286] hover:text-[#172238] text-sm w-6 h-6 flex items-center justify-center rounded-[3px] hover:bg-[#EAE5D9]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              {errorMsg && (
                <div className="text-xs text-[#A33B3B] bg-[#A33B3B]/10 p-2.5 rounded-[4px] border border-[#A33B3B]/20">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#687286] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D8D2C5] rounded-[4px] bg-white text-[#172238] focus:outline-none focus:ring-2 focus:ring-[#B48632]"
                  placeholder="First Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#687286] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D8D2C5] rounded-[4px] bg-white text-[#172238] focus:outline-none focus:ring-2 focus:ring-[#B48632]"
                  placeholder="Last Name (optional)"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#687286] hover:text-[#172238] hover:bg-[#F4F1E9] border border-[#D8D2C5] rounded-[4px] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 text-xs text-white bg-[#124D45] hover:bg-[#0E3E37] disabled:opacity-50 rounded-[4px] font-medium shadow-xs flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-[10px]"></i>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
