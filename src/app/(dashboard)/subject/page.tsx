import SubjectEntryForm from '@/components/SubjectEntryForm';

export default function SubjectPage() {
  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Enter a new subject here. It will become available in the dropdowns for Book and Syllabus entries.
        </p>
      </div>
      
      <SubjectEntryForm />
    </main>
  );
}
