'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

export default function Sidebar({ firstName }: { firstName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Data Entry</h2>
        <div className="mobile-only">
          <ProfileMenu firstName={firstName} />
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
          Syllabus Entry
        </Link>
        <Link href="/book" className={`nav-link ${pathname === '/book' ? 'active' : ''}`}>
          Book Entry
        </Link>
        <Link href="/subject" className={`nav-link ${pathname === '/subject' ? 'active' : ''}`}>
          Subject Entry
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
        <Link href="/view-data" className={`nav-link ${pathname === '/view-data' ? 'active' : ''}`}>
          View Data
        </Link>
      </nav>
    </aside>
  );
}
