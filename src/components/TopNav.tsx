'use client';

import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function TopNav({ 
  firstName, 
  role,
  toggleSidebar 
}: { 
  firstName: string,
  role?: string,
  toggleSidebar: () => void 
}) {
  const pathname = usePathname();
  
  let pageTitle = 'Syllabus';
  if (pathname === '/book') pageTitle = 'Books';
  else if (pathname === '/chapter') pageTitle = 'Chapters';
  else if (pathname === '/classes') pageTitle = 'Classes';
  else if (pathname === '/query') pageTitle = 'Query Entry';
  else if (pathname === '/school') pageTitle = 'Schools';
  else if (pathname === '/subject') pageTitle = 'Subjects';
  else if (pathname === '/topic') pageTitle = 'Topics';
  else if (pathname === '/') pageTitle = 'Syllabus';
  else if (pathname === '/task') pageTitle = 'Task Entry';
  else if (pathname === '/view-queries') pageTitle = 'Queries';
  else if (pathname === '/users') pageTitle = 'Profiles';
  else if (pathname === '/admin/users') pageTitle = 'Roles & Access';
  else if (pathname === '/notification') pageTitle = 'Approvals';
  else if (pathname === '/view-data') pageTitle = 'Academic Data';
  else if (pathname === '/view-tasks') pageTitle = 'Tasks';
  else if (pathname === '/employee-record') pageTitle = 'Employee Record';
  else if (pathname === '/view-employees') pageTitle = 'Employees';
  else if (pathname === '/bird-view') pageTitle = 'Bird View';
  else if (pathname === '/attendance') pageTitle = 'Attendance';
  else if (pathname === '/agent') pageTitle = 'Agent Assistant';

  return (
    <header className="h-[48px] bg-[#FFFEFA] border-b border-[#D8D2C5] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30 relative shadow-xs">
      {/* Left side: Hamburger Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          type="button"
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-[3px] border border-[#D8D2C5] bg-[#F4F1E9] text-[#687286] hover:text-[#172238] hover:bg-white flex items-center justify-center transition-colors outline-none focus:ring-2 focus:ring-[#2463EB]"
          title="Toggle Navigation"
        >
          <i className="fa-solid fa-bars text-xs"></i>
        </button>

        {/* Page Title */}
        <h1 className="text-[15px] sm:text-[16px] font-semibold text-[#172238] truncate tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right side: ProfileMenu */}
      <div className="flex items-center gap-3 shrink-0">
        <ProfileMenu firstName={firstName} role={role} />
      </div>
    </header>
  );
}
