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
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#172b4d' }}>
          Welcome, <span style={{ color: '#0d9488' }}>{uppercaseName}</span>!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Assign tasks to your students or colleagues.
        </p>
      </div>
      <TaskEntryClient currentUser={session} />
    </main>
  );
}
