import { getSession } from '@/lib/auth';
import ClientLayout from './ClientLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  return (
    <ClientLayout 
      initialFirstName={session?.firstName || ''} 
      initialRole={session?.role || 'STUDENT'}
    >
      {children}
    </ClientLayout>
  );
}
