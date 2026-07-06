import { getSession } from '@/lib/auth';
import TaskEntryClient from './TaskEntryClient';

export default async function TaskEntryPage() {
  const session = await getSession();
  
  let displayName = session?.username || 'User';
  if (session?.firstName || session?.lastName) {
    displayName = `${session?.firstName || ''} ${session?.lastName || ''}`.trim();
  }
  
  const uppercaseName = displayName.toUpperCase();

  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4 text-primaryDark">
          Welcome, <span style={{ color: '#0d9488' }}>{uppercaseName}</span>!
        </h1>
        <p className="text-gray-400 text-sm md:text-lg">
          Assign tasks to your students or colleagues.
        </p>
      </div>
      <TaskEntryClient currentUser={session} />
    </main>
  );
}
