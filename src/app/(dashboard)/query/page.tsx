import { getSession } from '@/lib/auth';
import QueryEntryClient from './QueryEntryClient';

export default async function QueryEntryPage() {
  const session = await getSession();
  
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#172b4d' }}>
          Submit a <span style={{ color: '#0d9488' }}>Query</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Ask a question or log a query for a student.
        </p>
      </div>
      <QueryEntryClient currentUser={session} />
    </main>
  );
}
