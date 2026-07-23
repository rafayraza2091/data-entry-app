'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function ProfileMenu({ firstName, role }: { firstName: string, role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
      window.location.href = '/login';
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  let roleColorClass = 'bg-gradient-to-br from-primary to-primaryDark';
  if (role === 'OWNER') roleColorClass = 'bg-roleOwner';
  else if (role === 'COORDINATOR') roleColorClass = 'bg-roleCoordinator';
  else if (role === 'TEACHER') roleColorClass = 'bg-roleTeacher';
  else if (role === 'STUDENT') roleColorClass = '';

  const studentStyle = role === 'STUDENT' ? { backgroundColor: getVibrantColor(firstName) } : undefined;

  return (
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
  );
}
