'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function Sidebar({ firstName, role }: { firstName: string, role?: string }) {
  const pathname = usePathname();

  const sectionStyle = {
    fontSize: '0.75rem', 
    textTransform: 'uppercase' as const, 
    color: '#64748b', 
    margin: '1rem 0 0.5rem 1rem', 
    letterSpacing: '0.05em', 
    fontWeight: 700
  };

  const dividerStyle = {
    ...sectionStyle,
    margin: '1.5rem 0 0.5rem 1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)', 
    paddingTop: '1rem'
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Data Entry</h2>
        <div className="mobile-only">
          <ProfileMenu firstName={firstName} />
        </div>
      </div>
      <nav className="sidebar-nav">
        
        {/* Entry Section */}
        <div style={sectionStyle}>Entry</div>
        <Link href="/task" className={`nav-link ${pathname === '/task' ? 'active' : ''}`}>
          Task Entry
        </Link>
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          Syllabus Entry
        </Link>
        <Link href="/book" className={`nav-link ${pathname === '/book' ? 'active' : ''}`}>
          Book Entry
        </Link>
        <Link href="/subject" className={`nav-link ${pathname === '/subject' ? 'active' : ''}`}>
          Subject Entry
        </Link>
        <Link href="/classes" className={`nav-link ${pathname === '/classes' ? 'active' : ''}`}>
          Class Entry
        </Link>
        <Link href="/school" className={`nav-link ${pathname === '/school' ? 'active' : ''}`}>
          School Entry
        </Link>
        <Link href="/chapter" className={`nav-link ${pathname === '/chapter' ? 'active' : ''}`}>
          Chapter Entry
        </Link>
        <Link href="/topic" className={`nav-link ${pathname === '/topic' ? 'active' : ''}`}>
          Topic Entry
        </Link>

        {/* View Section */}
        <div style={dividerStyle}>View</div>
        <Link href="/view-data" className={`nav-link ${pathname === '/view-data' ? 'active' : ''}`}>
          View Data
        </Link>
        <Link href="/view-tasks" className={`nav-link ${pathname === '/view-tasks' ? 'active' : ''}`}>
          View Tasks
        </Link>

        {/* User Management Section */}
        {role === 'OWNER' && (
          <>
            <div style={dividerStyle}>User Management</div>
            <Link href="/admin/users" className={`nav-link ${pathname === '/admin/users' ? 'active' : ''}`}>
              User Roles
            </Link>
            <Link href="/users" className={`nav-link ${pathname === '/users' ? 'active' : ''}`}>
              Users
            </Link>
            <Link href="/notification" className={`nav-link ${pathname === '/notification' ? 'active' : ''}`}>
              Notification
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
