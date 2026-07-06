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
    const { name, value } = e.target;
    setEditData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id: string) => {
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
      
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedRecord : emp));
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
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 border border-green-200 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-700 hover:text-green-900">
            <i className="fa-solid fa-xmark"></i>
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
              {employees.map((emp) => {
                const isEditing = editingId === emp.id;
                return (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-2 md:p-4 text-sm font-semibold text-gray-600">{emp.id}</td>
                    <td className="p-2 md:p-4 text-sm font-medium text-gray-900 flex gap-2">
                      {isEditing ? (
                        <>
                          <input type="text" name="firstName" value={editData.firstName || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-20" placeholder="First Name" />
                          <input type="text" name="secondName" value={editData.secondName || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-20" placeholder="Last Name" />
                        </>
                      ) : (
                        <>{emp.firstName} {emp.secondName || ''}</>
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="text" name="firstContact" value={editData.firstContact || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-24" />
                      ) : (
                        emp.firstContact
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="email" name="emailAddress" value={editData.emailAddress || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-32" />
                      ) : (
                        emp.emailAddress || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <select name="gender" value={editData.gender || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      ) : (
                        emp.gender
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="date" name="dateOfBirth" value={editData.dateOfBirth || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1" />
                      ) : (
                        emp.dateOfBirth || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <select name="latestDegree" value={editData.latestDegree || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1">
                          <option value="Under Matric">Under Matric</option>
                          <option value="Matric">Matric</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Bachelors">Bachelors</option>
                          <option value="Master">Master</option>
                          <option value="M.Phil">M.Phil</option>
                          <option value="PhD">PhD</option>
                        </select>
                      ) : (
                        emp.latestDegree || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="text" name="specialization" value={editData.specialization || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-24" />
                      ) : (
                        emp.specialization || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm">
                      {isEditing ? (
                        <select name="status" value={editData.status || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1">
                          <option value="Pending">Pending</option>
                          <option value="Employed">Employed</option>
                          <option value="Terminated">Terminated</option>
                          <option value="Left">Left</option>
                          <option value="Potential">Potential</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'Employed' ? 'bg-green-100 text-green-800' :
                          emp.status === 'Terminated' ? 'bg-red-100 text-red-800' :
                          emp.status === 'Left' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {emp.status}
                        </span>
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="date" name="fromDate" value={editData.fromDate || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1" />
                      ) : (
                        emp.fromDate || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm text-gray-600">
                      {isEditing ? (
                        <input type="text" name="toDate" value={editData.toDate || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-24" placeholder="YYYY-MM-DD or 'Currently working here'" />
                      ) : (
                        emp.toDate || '-'
                      )}
                    </td>
                    <td className="p-2 md:p-4 text-sm">
                      {isEditing ? (
                        <input type="text" name="linkedinId" value={editData.linkedinId || ''} onChange={handleEditChange} className="border border-gray-300 rounded px-2 py-1 w-24" />
                      ) : (
                        emp.linkedinId ? (
                          <a href={emp.linkedinId} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <i className="fa-brands fa-linkedin text-lg"></i>
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      )}
                    </td>
                    {role === 'OWNER' && (
                      <td className="p-2 md:p-4 text-sm">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleSave(emp.id)} disabled={saving} className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-teal-600 disabled:opacity-50">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={handleCancelEdit} disabled={saving} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 disabled:opacity-50">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(emp)} className="text-primary hover:text-teal-700 font-medium">
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
