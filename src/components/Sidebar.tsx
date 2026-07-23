'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
          className="fixed inset-0 bg-[#0F181B]/60 backdrop-blur-[1px] z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-[#172238] text-[#FFFEFA] z-50 flex flex-col transition-all duration-200 ease-in-out overflow-hidden border-r border-[#D8D2C5]/20 shadow-lg ${isExpanded ? 'w-[240px]' : 'w-[64px]'}`}>
        
        {/* Header */}
        <div className="h-[48px] flex items-center justify-between px-3.5 border-b border-[#D8D2C5]/20 shrink-0 bg-[#172238]">
          {isExpanded && (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-[2px] bg-[#124D45] text-white font-bold text-xs flex items-center justify-center border border-[#B48632]">M</span>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                My<span className="text-[#B48632]">Academy</span>
              </h2>
            </div>
          )}
          {!isExpanded && (
            <span className="w-6 h-6 rounded-[2px] bg-[#124D45] text-white font-bold text-xs flex items-center justify-center border border-[#B48632] mx-auto">
              M
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 flex flex-col gap-1 px-2 custom-scrollbar text-[12px]">
          
          {/* Daily Work Section */}
          <div>
            {isExpanded && <div className="text-[10px] uppercase text-[#687286] font-semibold mt-1 mb-1 px-2 tracking-wider">Daily Work</div>}
            
            <Link href="/bird-view" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/bird-view' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Bird View">
              <i className="fa-solid fa-chart-pie w-5 text-center text-[13px] text-[#B48632]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Bird View</span>}
            </Link>

            <Link href="/task" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/task' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="New Task">
              <i className="fa-solid fa-clipboard-check w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">New Task</span>}
            </Link>

            <Link href="/query" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/query' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="New Query">
              <i className="fa-solid fa-question-circle w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">New Query</span>}
            </Link>

            {(role === 'OWNER' || role === 'COORDINATOR' || role === 'TEACHER') && (
              <Link href="/attendance" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/attendance' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Attendance">
                <i className="fa-solid fa-calendar-check w-5 text-center text-[13px]"></i>
                {isExpanded && <span className="ml-2.5 truncate">Attendance</span>}
              </Link>
            )}
          </div>

          {/* Academic Catalogue Section */}
          <div className="mt-1 pt-1.5 border-t border-[#D8D2C5]/15">
            {isExpanded && <div className="text-[10px] uppercase text-[#687286] font-semibold mb-1 px-2 tracking-wider">Academic Catalogue</div>}
            
            <Link href="/" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Syllabus">
              <i className="fa-solid fa-book-open w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Syllabus</span>}
            </Link>

            <Link href="/school" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/school' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Schools">
              <i className="fa-solid fa-school w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Schools</span>}
            </Link>

            <Link href="/classes" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/classes' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Classes">
              <i className="fa-solid fa-chalkboard-user w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Classes</span>}
            </Link>

            <Link href="/subject" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/subject' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Subjects">
              <i className="fa-solid fa-bookmark w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Subjects</span>}
            </Link>

            <Link href="/book" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/book' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Books">
              <i className="fa-solid fa-book w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Books</span>}
            </Link>

            <Link href="/chapter" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/chapter' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Chapters">
              <i className="fa-solid fa-list-ol w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Chapters</span>}
            </Link>

            <Link href="/topic" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/topic' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Topics">
              <i className="fa-solid fa-file-lines w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Topics</span>}
            </Link>
          </div>

          {/* Records Section */}
          <div className="mt-1 pt-1.5 border-t border-[#D8D2C5]/15">
            {isExpanded && <div className="text-[10px] uppercase text-[#687286] font-semibold mb-1 px-2 tracking-wider">Records</div>}
            
            <Link href="/view-data" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/view-data' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Academic Data">
              <i className="fa-solid fa-table w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Academic Data</span>}
            </Link>

            <Link href="/view-tasks" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/view-tasks' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Tasks">
              <i className="fa-solid fa-tasks w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Tasks</span>}
            </Link>

            <Link href="/view-queries" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/view-queries' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Queries">
              <i className="fa-solid fa-clipboard-question w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Queries</span>}
            </Link>
          </div>

          {/* People Section */}
          <div className="mt-1 pt-1.5 border-t border-[#D8D2C5]/15">
            {isExpanded && <div className="text-[10px] uppercase text-[#687286] font-semibold mb-1 px-2 tracking-wider">People</div>}
            
            <Link href="/users" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/users' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Profiles">
              <i className="fa-solid fa-users w-5 text-center text-[13px]"></i>
              {isExpanded && <span className="ml-2.5 truncate">Profiles</span>}
            </Link>

            {(role === 'OWNER' || role === 'COORDINATOR') && (
              <>
                <Link href="/employee-record" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/employee-record' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Employee Record">
                  <i className="fa-solid fa-address-card w-5 text-center text-[13px]"></i>
                  {isExpanded && <span className="ml-2.5 truncate">Employee Record</span>}
                </Link>

                <Link href="/view-employees" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/view-employees' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Employees">
                  <i className="fa-solid fa-users-viewfinder w-5 text-center text-[13px]"></i>
                  {isExpanded && <span className="ml-2.5 truncate">Employees</span>}
                </Link>
              </>
            )}

            {role === 'OWNER' && (
              <>
                <Link href="/admin/users" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/admin/users' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Roles & Access">
                  <i className="fa-solid fa-user-shield w-5 text-center text-[13px]"></i>
                  {isExpanded && <span className="ml-2.5 truncate">Roles & Access</span>}
                </Link>
                
                <Link href="/notification" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/notification' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Approvals">
                  <i className="fa-solid fa-bell w-5 text-center text-[13px]"></i>
                  {isExpanded && <span className="ml-2.5 truncate">Approvals</span>}
                </Link>
              </>
            )}
          </div>

          {/* Owner Tools Section */}
          {role === 'OWNER' && (
            <div className="mt-1 pt-1.5 border-t border-[#D8D2C5]/15">
              {isExpanded && <div className="text-[10px] uppercase text-[#687286] font-semibold mb-1 px-2 tracking-wider">Owner Tools</div>}
              
              <Link href="/agent" className={`flex items-center h-[34px] px-2.5 rounded-[3px] transition-colors ${pathname === '/agent' ? 'bg-[#124D45]/40 text-white font-semibold border-l-2 border-[#B48632]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`} title="Agent Assistant">
                <i className="fa-solid fa-robot w-5 text-center text-[13px]"></i>
                {isExpanded && <span className="ml-2.5 truncate">Agent Assistant</span>}
              </Link>
            </div>
          )}
        </nav>
        
        {/* Footer Toggle */}
        <div className="p-2 border-t border-[#D8D2C5]/20 mt-auto flex justify-center bg-[#172238]">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="h-[30px] w-full max-w-[200px] rounded-[3px] bg-white/5 hover:bg-white/15 flex items-center justify-center gap-2 text-gray-300 text-xs font-medium transition-colors border border-white/10"
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <i className={`fa-solid ${isExpanded ? 'fa-chevron-left' : 'fa-chevron-right'} text-[11px]`}></i>
            {isExpanded && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
