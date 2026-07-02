import DataEntryForm from '@/components/DataEntryForm';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  
  let displayName = session?.username || 'User';
  if (session?.firstName || session?.lastName) {
    displayName = `${session?.firstName || ''} ${session?.lastName || ''}`.trim();
  }
  
  const uppercaseName = displayName.toUpperCase();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Welcome, <span style={{ color: '#3b82f6' }}>{uppercaseName}</span>!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Add a syllabus entry
        </p>
      </div>
      
      <DataEntryForm />
    </main>
  );
}
