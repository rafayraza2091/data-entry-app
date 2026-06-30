import SchoolEntryForm from '@/components/SchoolEntryForm';

export default function SchoolPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Add a <span style={{ color: '#3b82f6' }}>School</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Register a new school branch here to use it in Book Entries.
        </p>
      </div>
      
      <SchoolEntryForm />
    </main>
  );
}
