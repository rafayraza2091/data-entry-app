import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ViewEmployeesClient from './ViewEmployeesClient';

export default async function ViewEmployeesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Double check authorization, though middleware should handle this
  const role = session.role as string;
  if (role !== 'OWNER' && role !== 'COORDINATOR') {
    redirect('/view-data');
  }

  return <ViewEmployeesClient />;
}
