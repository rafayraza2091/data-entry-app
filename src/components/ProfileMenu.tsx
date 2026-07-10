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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        className={`w-8 h-8 rounded-full ${roleColorClass} text-white flex items-center justify-center text-sm font-semibold border-none cursor-pointer transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50`} 
        style={studentStyle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        style={{ pointerEvents: 'auto' }}
      >
        {initial}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden animate-[fadeIn_0.2s_ease]">
          <div className="p-4 border-b border-gray-100 font-medium text-headingGray">
            <p>Hi, {firstName || 'User'}!</p>
          </div>
          <button 
            className="w-full text-left px-4 py-3 text-danger text-sm font-medium hover:bg-danger/10 transition-colors focus:outline-none" 
            onClick={handleLogout}
            style={{ pointerEvents: 'auto' }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
