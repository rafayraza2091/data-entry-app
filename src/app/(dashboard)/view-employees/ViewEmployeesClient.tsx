'use client';

import { useState, useEffect } from 'react';

export default function ViewEmployeesClient({ role }: { role?: string }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/employees');
        if (!response.ok) throw new Error('Failed to fetch employee records');
        const data = await response.json();
        setEmployees(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEditClick = (emp: any) => {
    setEditingId(emp.id);
    setEditData({ ...emp });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setEditData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm('Are you sure you want to save these changes?');
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update employee');
      }

      const updatedRecord = await response.json();
      
      setEmployees(prev => prev.map(emp => emp.id === editingId ? updatedRecord : emp));
      setEditingId(null);
      setSuccessMsg('Information updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
      </div>
    );
  }

  if (error && !editingId) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md mx-6 mt-6 border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="animate-slide-up p-4 md:p-8">
      {successMsg && (
        <div className="fixed top-24 right-8 z-[100] animate-fade-in bg-green-50 text-green-700 px-6 py-4 rounded-lg shadow-xl border border-green-200 flex items-center justify-between min-w-[300px]">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-circle-check text-xl"></i>
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-green-700 hover:text-green-900 ml-6">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          No employee records found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
                <th className="p-2 md:p-4 font-semibold">ID</th>
                <th className="p-2 md:p-4 font-semibold">Name</th>
                <th className="p-2 md:p-4 font-semibold">Contact</th>
                <th className="p-2 md:p-4 font-semibold">Email</th>
                <th className="p-2 md:p-4 font-semibold">Gender</th>
                <th className="p-2 md:p-4 font-semibold">DOB</th>
                <th className="p-2 md:p-4 font-semibold">Degree</th>
                <th className="p-2 md:p-4 font-semibold">Specialization</th>
                <th className="p-2 md:p-4 font-semibold">Status</th>
                <th className="p-2 md:p-4 font-semibold">From Date</th>
                <th className="p-2 md:p-4 font-semibold">To Date</th>
                <th className="p-2 md:p-4 font-semibold">LinkedIn ID</th>
                {role === 'OWNER' && <th className="p-2 md:p-4 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-2 md:p-4 text-sm font-semibold text-gray-600">{emp.id}</td>
                  <td className="p-2 md:p-4 text-sm font-medium text-gray-900">
                    {emp.firstName} {emp.secondName || ''}
                  </td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.firstContact}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.emailAddress || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.gender}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.dateOfBirth || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.latestDegree || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.specialization || '-'}</td>
                  <td className="p-2 md:p-4 text-sm">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'Employed' ? 'bg-green-100 text-green-800' :
                      emp.status === 'Terminated' ? 'bg-red-100 text-red-800' :
                      emp.status === 'Left' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.fromDate || '-'}</td>
                  <td className="p-2 md:p-4 text-sm text-gray-600">{emp.toDate || '-'}</td>
                  <td className="p-2 md:p-4 text-sm">
                    {emp.linkedinId ? (
                      <a href={emp.linkedinId} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <i className="fa-brands fa-linkedin text-lg"></i>
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  {role === 'OWNER' && (
                    <td className="p-2 md:p-4 text-sm">
                      <button onClick={() => handleEditClick(emp)} className="text-primary hover:text-teal-700 font-medium border border-primary px-3 py-1 rounded transition-colors hover:bg-teal-50">
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
            <button 
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Edit Employee Record</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
                Error: {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" name="firstName" value={editData.firstName || ''} onChange={handleEditChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Second Name</label>
                  <input type="text" name="secondName" value={editData.secondName || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  <input type="text" name="fatherName" value={editData.fatherName || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={editData.address || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Contact *</label>
                  <input type="text" name="firstContact" value={editData.firstContact || ''} onChange={handleEditChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Second Contact</label>
                  <input type="text" name="secondContact" value={editData.secondContact || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" name="emailAddress" value={editData.emailAddress || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={editData.dateOfBirth || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select name="gender" value={editData.gender || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn ID</label>
                  <input type="url" name="linkedinId" value={editData.linkedinId || ''} onChange={handleEditChange} placeholder="https://linkedin.com/in/..." className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education Degree</label>
                  <select name="latestDegree" value={editData.latestDegree || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                    <option value="Under Matric">Under Matric</option>
                    <option value="Matric">Matric</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Master">Master</option>
                    <option value="M.Phil">M.Phil</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                {editData.latestDegree && editData.latestDegree !== 'Under Matric' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Specialization</label>
                    <input type="text" name="specialization" value={editData.specialization || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Status</label>
                  <select name="status" value={editData.status || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2 bg-white">
                    <option value="Pending">Pending</option>
                    <option value="Employed">Employed</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Left">Left</option>
                    <option value="Potential">Potential</option>
                  </select>
                </div>
                
                {['Employed', 'Terminated', 'Left'].includes(editData.status) && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input type="date" name="fromDate" value={editData.fromDate || ''} onChange={handleEditChange} className="w-full border border-gray-300 rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input type="date" name="toDate" value={editData.currentlyWorking ? '' : (editData.toDate === 'Currently working here' ? '' : editData.toDate)} onChange={handleEditChange} disabled={editData.currentlyWorking} className="w-full border border-gray-300 rounded px-3 py-2 mb-2" />
                      <div className="flex items-center">
                        <input type="checkbox" id="currentlyWorking" name="currentlyWorking" checked={editData.currentlyWorking || editData.toDate === 'Currently working here'} onChange={handleEditChange} className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
                        <label htmlFor="currentlyWorking" className="text-sm font-medium text-gray-700 cursor-pointer">Currently working there</label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-teal-600 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleCancelEdit} disabled={saving} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
