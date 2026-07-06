'use client';

import { useState, useEffect } from 'react';
import ImageCropper from '@/components/ImageCropper';

export default function ViewQueriesClient({ currentUser }: { currentUser: any }) {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dropdown lists for the edit modal
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [booksList, setBooksList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);

  // Editing state
  const [editingQuery, setEditingQuery] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image viewer state
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // New Image attachment state for editing
  const [croppedImages, setCroppedImages] = useState<Blob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [qRes, sRes, bRes, tRes] = await Promise.all([
          fetch('/api/queries'),
          fetch('/api/subjects'),
          fetch('/api/books'),
          fetch('/api/topics')
        ]);

        if (!qRes.ok) throw new Error('Failed to fetch queries');
        const data = await qRes.json();

        // Apply filtering based on role
        if (currentUser.role === 'STUDENT') {
          const studentFullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
          const filtered = data.filter((q: any) => q.studentName === studentFullName);
          setQueries(filtered);
        } else {
          setQueries(data);
        }

        if (sRes.ok) setSubjectsList(await sRes.json());
        if (bRes.ok) setBooksList(await bRes.json());
        if (tRes.ok) setTopicsList(await tRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuery) return;
    setIsSaving(true);

    try {
      let imageUrls = [...(editingQuery.images || [])];

      if (croppedImages.length > 0) {
        const formData = new FormData();
        croppedImages.forEach(blob => {
          formData.append('images', blob, 'cropped.jpg');
        });
        formData.append('schoolName', editingQuery.schoolName || 'UnknownSchool');
        formData.append('className', editingQuery.className || 'UnknownClass');
        formData.append('studentName', editingQuery.studentName || 'UnknownStudent');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error('Failed to upload new images');
        }
        const uploadData = await uploadRes.json();
        if (uploadData.urls) {
          imageUrls = [...imageUrls, ...uploadData.urls];
        }
      }

      const response = await fetch(`/api/queries/${editingQuery.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingQuery, images: imageUrls }),
      });

      if (response.ok) {
        const updated = await response.json();
        setQueries(queries.map(q => q.id === editingQuery.id ? updated : q));
        setEditingQuery(null);
        setCroppedImages([]);
      } else {
        console.error('Failed to update query');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || 'open').toLowerCase();
    if (s === 'open') return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold uppercase">Open</span>;
    if (s === 'pending') return <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs font-semibold uppercase">Pending</span>;
    if (s === 'done') return <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold uppercase">Done</span>;
    return <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold uppercase">{s}</span>;
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const fetchImage = async () => {
        const response = await fetch(imageUrl);
        let blob = await response.blob();
        
        // Safari requires image/png for clipboard
        if (blob.type !== 'image/png') {
          blob = await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) return reject(new Error('No context'));
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = imageUrl;
          });
        }
        return blob;
      };

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': fetchImage()
        })
      ]);
      alert('Image copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy image:', error);
      alert('Failed to copy image. Your browser might not support this feature.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading queries...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

  return (
    <div className="animate-slide-up p-4 md:p-8">
      {currentUser.role === 'STUDENT' && (
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">
          My Queries
        </h1>
      )}

      {queries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No queries found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
                <th className="p-2 md:p-4 font-semibold">Date</th>
                <th className="p-2 md:p-4 font-semibold">Created By</th>
                <th className="p-2 md:p-4 font-semibold">Teacher</th>
                <th className="p-2 md:p-4 font-semibold">Student</th>
                <th className="p-2 md:p-4 font-semibold">Class</th>
                <th className="p-2 md:p-4 font-semibold">Subject</th>
                <th className="p-2 md:p-4 font-semibold">Book</th>
                <th className="p-2 md:p-4 font-semibold">Chapter</th>
                <th className="p-2 md:p-4 font-semibold">Topic</th>
                <th className="p-2 md:p-4 font-semibold">Exercise</th>
                <th className="p-2 md:p-4 font-semibold">Page Number</th>
                <th className="p-2 md:p-4 font-semibold min-w-[200px]">Query Statement</th>
                <th className="p-2 md:p-4 font-semibold">Attachments</th>
                <th className="p-2 md:p-4 font-semibold">Status</th>
                <th className="p-2 md:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 md:p-4 text-sm text-gray-600">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 md:p-4 text-sm font-medium text-teal-700">{q.createdBy || '-'}</td>
                  <td className="p-2 md:p-4 text-sm font-medium text-gray-900">{q.teacherName}</td>
                  <td className="p-2 md:p-4 text-sm font-medium text-gray-900">{q.studentName}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.className}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.subject}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.book || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.chapter || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.topic || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.exercise || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{q.pageNumber || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-700 max-w-[250px] truncate" title={q.queryStatement}>
                    {q.queryStatement}
                  </td>
                  <td className="p-2 md:p-4 text-sm">
                    {q.images && q.images.length > 0 ? (
                      <button 
                        onClick={() => { setViewingImages(q.images); setCurrentImageIndex(0); }}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        Images ({q.images.length})
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2 md:p-4 text-sm">
                    {getStatusBadge(q.status)}
                  </td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">
                    <button 
                      onClick={() => setEditingQuery({ ...q })}
                      className="px-3 py-1 bg-teal-50 text-teal-600 rounded border border-teal-100 hover:bg-teal-100 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Edit Query</h2>
              <button onClick={() => setEditingQuery(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Non-editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <input type="text" disabled value={editingQuery.studentName} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                  <input type="text" disabled value={editingQuery.teacherName} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" disabled value={editingQuery.className} className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-600 cursor-not-allowed" />
                </div>
                
                {/* Editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    value={editingQuery.subject || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, subject: e.target.value, book: '', topic: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="" disabled>Select Subject</option>
                    {subjectsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book (Optional)</label>
                  <select 
                    value={editingQuery.book || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, book: e.target.value, topic: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Book</option>
                    {booksList.filter(b => b.subject === editingQuery.subject).map(b => (
                      <option key={b.id} value={b.title}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.chapter || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, chapter: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic (Optional)</label>
                  <select 
                    value={editingQuery.topic || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, topic: e.target.value, exercise: '' })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Topic</option>
                    {topicsList
                      .filter(t => t.subject === editingQuery.subject && (editingQuery.book ? t.book === editingQuery.book : true))
                      .map((t, i) => <option key={i} value={t.topicName || ''}>{t.topicName}</option>)
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.exercise || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, exercise: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Number (Optional)</label>
                  <input 
                    type="text" 
                    value={editingQuery.pageNumber || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, pageNumber: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={editingQuery.status || 'open'} 
                    onChange={e => setEditingQuery({ ...editingQuery, status: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Query Statement</label>
                  <textarea 
                    value={editingQuery.queryStatement || ''} 
                    onChange={e => setEditingQuery({ ...editingQuery, queryStatement: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                    required
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">Add More Attachments</label>
                
                <input
                  type="file"
                  accept="image/*"
                  id="edit-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                      setIsCropping(true);
                    }
                    e.target.value = '';
                  }}
                />
                
                <div className="flex flex-wrap gap-4 items-start">
                  {/* Current existing images */}
                  {editingQuery.images?.map((url: string, index: number) => (
                    <div key={`existing-${index}`} className="relative border border-gray-200 rounded p-1">
                      <img 
                        src={url} 
                        alt="Existing Attachment" 
                        className="w-24 h-24 object-cover rounded"
                      />
                    </div>
                  ))}

                  {/* New cropped images preview */}
                  {croppedImages.map((blob, index) => (
                    <div key={`new-${index}`} className="relative border border-teal-200 bg-teal-50 rounded p-1">
                      <img 
                        src={URL.createObjectURL(blob)} 
                        alt="New Cropped preview" 
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setCroppedImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-sm text-sm"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  <button
                    type="button"
                    onClick={() => document.getElementById('edit-file-upload')?.click()}
                    className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded hover:bg-gray-50 hover:border-teal-500 hover:text-teal-600 transition-colors text-gray-500"
                  >
                    <span className="text-2xl mb-1">+</span>
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => { setEditingQuery(null); setCroppedImages([]); }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4">
          <div className="absolute top-6 right-6 flex items-center gap-6 z-50">
            <button
              onClick={() => copyImageToClipboard(viewingImages[currentImageIndex])}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded transition-colors font-medium text-sm border border-white/40 backdrop-blur-sm"
              title="Copy Image"
            >
              Copy Image
            </button>
            <button 
              onClick={() => setViewingImages([])}
              className="text-white hover:text-gray-300 text-4xl leading-none"
              title="Close"
            >
              &times;
            </button>
          </div>
          
          <div className="relative flex items-center justify-center w-full max-w-5xl h-full max-h-[80vh]">
            {viewingImages.length > 1 && (
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : viewingImages.length - 1))}
                className="absolute left-0 text-white hover:text-gray-300 text-5xl px-4 py-8"
              >
                &#8249;
              </button>
            )}
            
            <img 
              src={viewingImages[currentImageIndex]} 
              alt={`Attachment ${currentImageIndex + 1}`} 
              className="max-w-full max-h-full object-contain"
            />
            
            {viewingImages.length > 1 && (
              <button 
                onClick={() => setCurrentImageIndex((prev) => (prev < viewingImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-0 text-white hover:text-gray-300 text-5xl px-4 py-8"
              >
                &#8250;
              </button>
            )}
          </div>
          
          {viewingImages.length > 1 && (
            <div className="text-white mt-4 text-lg">
              {currentImageIndex + 1} / {viewingImages.length}
            </div>
          )}
        </div>
      )}

      {/* Image Cropper Modal */}
      {isCropping && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={(croppedBlob) => {
            setCroppedImages(prev => [...prev, croppedBlob]);
            setIsCropping(false);
            setSelectedFile(null);
          }}
          onCancel={() => {
            setIsCropping(false);
            setSelectedFile(null);
          }}
        />
      )}

    </div>
  );
}
