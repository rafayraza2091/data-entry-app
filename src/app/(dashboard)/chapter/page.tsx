import ChapterEntryForm from '@/components/ChapterEntryForm';

export default function ChapterPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Register chapters for specific books here.
        </p>
      </div>
      
      <ChapterEntryForm />
    </main>
  );
}
