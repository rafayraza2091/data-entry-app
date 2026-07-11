'use client';

import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
  initialFirstName,
  initialRole,
  initialSidebarExpanded
}: {
  children: React.ReactNode;
  initialFirstName: string;
  initialRole: string;
  initialSidebarExpanded?: boolean;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(initialSidebarExpanded ?? true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    setIsMobile(!isDesktop);
    
    // State is already initialized synchronously in useState, so no need to set it here initially.

    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsMobile(!desktop);
      if (!desktop) {
        setIsSidebarExpanded(false);
      } else {
        const savedState = localStorage.getItem('sidebarExpanded');
        if (savedState !== null) {
          setIsSidebarExpanded(savedState === 'true');
        } else {
          setIsSidebarExpanded(true);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSetSidebarExpanded = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
    if (!isMobile) {
      document.cookie = `sidebarExpanded=${expanded}; path=/; max-age=31536000`; // 1 year
      localStorage.setItem('sidebarExpanded', String(expanded));
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        firstName={initialFirstName} 
        role={initialRole} 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={handleSetSidebarExpanded}
        isMobile={isMobile}
      />
      <div className={`main-content ${isSidebarExpanded ? 'expanded' : ''}`}>
        <TopNav firstName={initialFirstName} role={initialRole} toggleSidebar={() => handleSetSidebarExpanded(!isSidebarExpanded)} />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
