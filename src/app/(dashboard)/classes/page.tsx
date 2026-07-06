'use client';

import { useState, useEffect } from 'react';

export default function ClassesPage() {
  const [className, setClassName] = useState('');
  const [classes, setClasses] = useState<{ id: number; name: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add class');
      }

      setSuccess(true);
      setClassName('');
      fetchClasses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: '100%' }}>
      <div className="text-center mb-1 md:mb-12">
        <p className="text-gray-400 text-sm md:text-lg">
          Enter a new class here. It will become available in the dropdowns for Book and Syllabus entries.
        </p>
      </div>

      <div className="content-container">
        <div className="glass-panel animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          
          {success && (
            <div className="status-message status-success">
              Class added successfully!
            </div>
          )}
          
          {error && (
            <div className="status-message status-error">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: '1.5rem', flex: 1 }}>
                <label htmlFor="className" className="form-label">Class Name</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="form-control"
                  placeholder="e.g. 6, 8, 9 Matric, FSC part 1"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Saving...' : 'Add Class'}
            </button>
          </form>
        </div>

        <div className="glass-panel animate-slide-up" style={{ maxWidth: '800px', margin: '0 auto', animationDelay: '0.1s' }}>
          
          {initialLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading classes...</p>
          ) : classes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No classes added yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {classes.map((cls) => (
                <div key={cls.id} className="form-control" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', pointerEvents: 'none' }}>
                  <span style={{ fontWeight: 500 }}>{cls.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
