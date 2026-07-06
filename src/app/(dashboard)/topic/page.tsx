import TopicEntryForm from '@/components/TopicEntryForm';

export default function TopicPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Register topics for specific chapters here.
        </p>
      </div>
      
      <TopicEntryForm />
    </main>
  );
}
