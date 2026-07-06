import DataEntryForm from '@/components/DataEntryForm';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();

  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Please fill out the form below to add a new syllabus entry to the database.
        </p>
      </div>
      
      <DataEntryForm />
    </main>
  );
}
