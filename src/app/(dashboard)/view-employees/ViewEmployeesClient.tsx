'use client';

import { useState, useEffect } from 'react';

export default function ViewEmployeesClient() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <i className="fa-solid fa-spinner fa-spin text-4xl"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md mx-6 mt-6 border border-red-200">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="animate-slide-up p-4 md:p-8">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
