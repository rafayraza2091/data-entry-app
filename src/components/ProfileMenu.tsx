'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileMenu({ firstName }: { firstName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const handleLogout = async () => {
    try {
      // Force navigation first for better UX
      router.push('/login');
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
      // Fallback
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

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primaryDark text-white flex items-center justify-center text-sm font-semibold border-none cursor-pointer transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
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
