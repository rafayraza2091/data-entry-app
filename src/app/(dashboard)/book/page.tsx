import BookEntryForm from '@/components/BookEntryForm';

export default function BookPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#172b4d' }}>
          Add a <span style={{ color: '#0d9488' }}>Book</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Please fill out the form below to add a new book to the database.
        </p>
      </div>
      
      <BookEntryForm />
    </main>
  );
}
