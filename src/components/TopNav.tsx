'use client';

import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function TopNav({ 
  firstName, 
  toggleSidebar 
}: { 
  firstName: string,
  toggleSidebar: () => void 
}) {
  const pathname = usePathname();
  
  let pageTitle = 'Dashboard';
  if (pathname === '/book') pageTitle = 'Book Entry';
  else if (pathname === '/chapter') pageTitle = 'Chapter Entry';
  else if (pathname === '/classes') pageTitle = 'Class Entry';
  else if (pathname === '/query') pageTitle = 'Query Entry';
  else if (pathname === '/school') pageTitle = 'School Entry';
  else if (pathname === '/subject') pageTitle = 'Subject Entry';
  else if (pathname === '/topic') pageTitle = 'Topic Entry';
  else if (pathname === '/') pageTitle = 'Syllabus';
  else if (pathname === '/task') pageTitle = 'Task Entry';
  else if (pathname === '/view-queries') pageTitle = 'View Queries';
  else if (pathname === '/users') pageTitle = 'User Management';
  else if (pathname === '/notification') pageTitle = 'Notifications';
  else if (pathname === '/view-data') pageTitle = 'View Data';
  else if (pathname === '/view-tasks') pageTitle = 'Task Viewer';
  else if (pathname === '/employee-record') pageTitle = 'Employee Record';
  else if (pathname === '/view-employees') pageTitle = 'Employed Staff';

  return (
    <header className="h-[40px] bg-white border-b border-gray-200 flex items-center px-6 shrink-0 shadow-sm z-10 relative">
      {/* Left side: Hamburger */}
      <div className="flex-none">
        <button 
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-primary transition-colors focus:outline-none"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
      
      {/* Center: Title */}
      <div className="flex-1 flex justify-center overflow-hidden px-4">
        <h1 className="text-xl md:text-2xl font-bold text-primaryDark truncate tracking-tight leading-none pt-1">
          {pageTitle}
        </h1>
      </div>

      {/* Right side: ProfileMenu */}
      <div className="flex-none">
        <ProfileMenu firstName={firstName} />
      </div>
    </header>
  );
}
