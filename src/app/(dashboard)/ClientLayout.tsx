'use client';

import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
  initialFirstName,
  initialRole
}: {
  children: React.ReactNode;
  initialFirstName: string;
  initialRole: string;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarExpanded(false);
      } else {
        setIsMobile(false);
        setIsSidebarExpanded(true);
      }
    };
    
    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="app-container">
      <Sidebar 
        firstName={initialFirstName} 
        role={initialRole} 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded}
        isMobile={isMobile}
      />
      <div className={`main-content ${isSidebarExpanded ? 'expanded' : ''}`}>
        <TopNav firstName={initialFirstName} role={initialRole} toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} />
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
