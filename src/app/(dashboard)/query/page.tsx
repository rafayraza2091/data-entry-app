import { getSession } from '@/lib/auth';
import QueryEntryClient from './QueryEntryClient';

export default async function QueryEntryPage() {
  const session = await getSession();
  
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Ask a question or log a query for a student.
        </p>
      </div>
      <QueryEntryClient currentUser={session} />
    </main>
  );
}
