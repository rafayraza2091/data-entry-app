import TopicEntryForm from '@/components/TopicEntryForm';

export default function TopicPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
          Add a <span style={{ color: '#3b82f6' }}>Topic</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Register topics for specific chapters here.
        </p>
      </div>
      
      <TopicEntryForm />
    </main>
  );
}
