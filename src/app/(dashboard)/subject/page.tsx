import SubjectEntryForm from '@/components/SubjectEntryForm';

export default function SubjectPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Add a <span style={{ color: '#3b82f6' }}>Subject</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Enter a new subject here. It will become available in the dropdowns for Book and Syllabus entries.
        </p>
      </div>
      
      <SubjectEntryForm />
    </main>
  );
}
