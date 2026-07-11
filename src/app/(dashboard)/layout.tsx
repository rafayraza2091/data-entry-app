import { getSession } from '@/lib/auth';
import ClientLayout from './ClientLayout';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const cookieStore = await cookies();
  const sidebarExpandedCookie = cookieStore.get('sidebarExpanded');
  const initialSidebarExpanded = sidebarExpandedCookie ? sidebarExpandedCookie.value === 'true' : true;
  
  return (
    <ClientLayout 
      initialFirstName={session.firstName} 
      initialRole={session.role}
      initialSidebarExpanded={initialSidebarExpanded}
    >
      {children}
    </ClientLayout>
  );
}
