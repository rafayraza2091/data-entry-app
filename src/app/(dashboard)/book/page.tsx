import BookEntryForm from '@/components/BookEntryForm';

export default function BookPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Please fill out the form below to add a new book to the database.
        </p>
      </div>
      
      <BookEntryForm />
    </main>
  );
}
