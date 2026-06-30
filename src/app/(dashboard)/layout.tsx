import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import { getSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const firstName = session?.firstName || '';

  return (
    <div className="app-wrapper">
      <TopNav firstName={firstName} />
      <div className="app-layout">
        <Sidebar firstName={firstName} />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
