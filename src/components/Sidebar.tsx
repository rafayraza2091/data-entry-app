'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function Sidebar({ 
  firstName, 
  role,
  isExpanded,
  setIsExpanded,
  isMobile
}: { 
  firstName: string, 
  role?: string,
  isExpanded: boolean,
  setIsExpanded: (val: boolean) => void,
  isMobile: boolean
}) {
  const pathname = usePathname();

  // If mobile and not expanded, hide it completely
  if (isMobile && !isExpanded) return null;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-headingGray text-white z-50 flex flex-col transition-all duration-300 ease-in-out overflow-hidden shadow-lg ${isExpanded ? 'w-[250px]' : 'w-[60px]'}`}>
        
        {/* Header */}
        <div className="h-[70px] flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          {isExpanded && <h2 className="text-xl font-bold text-white whitespace-nowrap"><span className="text-primary">My</span>Academy</h2>}
          {!isExpanded && <h2 className="text-xl font-bold text-primary mx-auto">M</h2>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 custom-scrollbar">
          
          {/* Entry Section */}
          {isExpanded && <div className="text-xs uppercase text-subtextGray font-bold mt-4 mb-2 px-2 tracking-wider">Entry</div>}
          
          <Link href="/task" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/task' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Task Entry">
            <i className="fa-solid fa-clipboard-check w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Task Entry</span>}
          </Link>
          
          <Link href="/" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Syllabus Entry">
            <i className="fa-solid fa-book-open w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Syllabus Entry</span>}
          </Link>

          <Link href="/book" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/book' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Book Entry">
            <i className="fa-solid fa-book w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Book Entry</span>}
          </Link>

          <Link href="/subject" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/subject' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Subject Entry">
            <i className="fa-solid fa-bookmark w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Subject Entry</span>}
          </Link>

          <Link href="/classes" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/classes' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Class Entry">
            <i className="fa-solid fa-chalkboard-user w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Class Entry</span>}
          </Link>

          <Link href="/school" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/school' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="School Entry">
            <i className="fa-solid fa-school w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">School Entry</span>}
          </Link>

          <Link href="/chapter" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/chapter' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Chapter Entry">
            <i className="fa-solid fa-list-ol w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Chapter Entry</span>}
          </Link>

          <Link href="/topic" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/topic' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Topic Entry">
            <i className="fa-solid fa-file-lines w-6 text-center"></i>
            {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Topic Entry</span>}
          </Link>

          {/* View Section */}
          <div className="mt-4 pt-4 border-t border-white/10">
            {isExpanded && <div className="text-xs uppercase text-subtextGray font-bold mb-2 px-2 tracking-wider">View</div>}
            
            <Link href="/view-data" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/view-data' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="View Data">
              <i className="fa-solid fa-table w-6 text-center"></i>
              {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">View Data</span>}
            </Link>

            <Link href="/view-tasks" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/view-tasks' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="View Tasks">
              <i className="fa-solid fa-tasks w-6 text-center"></i>
              {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">View Tasks</span>}
            </Link>
          </div>

          {/* User Management Section */}
          {role === 'OWNER' && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {isExpanded && <div className="text-xs uppercase text-subtextGray font-bold mb-2 px-2 tracking-wider">Owner Tools</div>}
              
              <Link href="/agent" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/agent' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Agent Assistant">
                <i className="fa-solid fa-robot w-6 text-center"></i>
                {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Agent Assistant</span>}
              </Link>
              
              <Link href="/admin/users" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/admin/users' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="User Roles">
                <i className="fa-solid fa-user-shield w-6 text-center"></i>
                {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">User Roles</span>}
              </Link>
              
              <Link href="/users" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/users' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Users">
                <i className="fa-solid fa-users w-6 text-center"></i>
                {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Users</span>}
              </Link>
              
              <Link href="/notification" className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${pathname === '/notification' ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Notification">
                <i className="fa-solid fa-bell w-6 text-center"></i>
                {isExpanded && <span className="ml-3 font-medium whitespace-nowrap">Notification</span>}
              </Link>
            </div>
          )}
        </nav>
        
        {/* Footer Toggle */}
        <div className="p-3 border-t border-white/10 mt-auto flex justify-center">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
          >
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
      </aside>
    </>
  );
}
