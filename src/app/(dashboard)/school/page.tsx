import SchoolEntryForm from '@/components/SchoolEntryForm';

export default function SchoolPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Register a new school branch here to use it in Book Entries.
        </p>
      </div>
      
      <SchoolEntryForm />
    </main>
  );
}
