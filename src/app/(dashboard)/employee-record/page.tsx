import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import EmployeeRecordClient from './EmployeeRecordClient';

export default async function EmployeeRecordPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'OWNER' && session.role !== 'COORDINATOR') {
    redirect('/view-data');
  }

  return <EmployeeRecordClient />;
}
