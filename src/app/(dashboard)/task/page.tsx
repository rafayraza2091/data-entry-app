import { getSession } from '@/lib/auth';
import TaskEntryClient from './TaskEntryClient';

export default async function TaskEntryPage() {
  const session = await getSession();
  return <TaskEntryClient currentUser={session} />;
}
