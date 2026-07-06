'use client';

import React, { useState } from 'react';

export default function EmployeeRecordClient({ 
  isModal, 
  onSuccess, 
  onCancel 
}: { 
  isModal?: boolean; 
  onSuccess?: () => void; 
  onCancel?: () => void; 
} = {}) {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    fatherName: '',
    address: '',
    firstContact: '',
    secondContact: '',
    linkedinId: '',
    emailAddress: '',
    dateOfBirth: '',
    latestDegree: 'Under Matric',
    specialization: '',
    gender: 'Male',
    status: 'Pending',
    fromDate: '',
    toDate: '',
    currentlyWorking: false
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const statusOptions = ['Employed', 'Terminated', 'Left', 'Pending', 'Potential'];
  const showDateFields = ['Employed', 'Terminated', 'Left'].includes(formData.status);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: 'loading', message: 'Submitting...' });

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save record');
      }

      setStatusMsg({ type: 'success', message: 'Employee record saved successfully!' });
      setFormData({
        firstName: '',
        secondName: '',
        fatherName: '',
        address: '',
        firstContact: '',
        secondContact: '',
        linkedinId: '',
        emailAddress: '',
        dateOfBirth: '',
        latestDegree: 'Under Matric',
        specialization: '',
        gender: 'Male',
        status: 'Pending',
        fromDate: '',
        toDate: '',
        currentlyWorking: false
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => setStatusMsg({ type: 'idle', message: '' }), 3000);
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', message: err.message || 'An error occurred while submitting.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={isModal ? 'w-full' : 'container'} style={isModal ? {} : { maxWidth: '100%' }}>
      {!isModal && (
        <div className="text-center mb-1 md:mb-12 mt-6">
          <p className="text-gray-400 text-sm md:text-lg">
            Please fill out the form below to add a new employee record to the database.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={isModal ? '' : 'glass-panel animate-slide-up'} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {isModal && <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Employee Record</h2>}
        
        {statusMsg.message && (
          <div className={`mb-6 p-4 rounded-md text-sm font-medium ${
            statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
            statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {statusMsg.message}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input 
              type="text" 
              name="firstName"
              className="form-control" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="Enter first name"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Second Name</label>
            <input 
              type="text" 
              name="secondName"
              className="form-control" 
              value={formData.secondName} 
              placeholder="Enter second name"
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Father's Name</label>
            <input 
              type="text" 
              name="fatherName"
              className="form-control" 
              value={formData.fatherName} 
              placeholder="Enter father's name"
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input 
              type="text" 
              name="address"
              className="form-control" 
              value={formData.address} 
              placeholder="Enter address"
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Contact *</label>
            <input 
              type="text" 
              name="firstContact"
              className="form-control" 
              value={formData.firstContact} 
              onChange={handleChange} 
              placeholder="Enter main contact number"
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Second Contact</label>
            <input 
              type="text" 
              name="secondContact"
              className="form-control" 
              value={formData.secondContact} 
              placeholder="Enter alternate contact number"
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="emailAddress"
              className="form-control" 
              value={formData.emailAddress} 
              onChange={handleChange} 
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input 
              type="date" 
              name="dateOfBirth"
              className="form-control" 
              value={formData.dateOfBirth} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Latest Education Degree</label>
            <select 
              name="latestDegree"
              className="form-control" 
              value={formData.latestDegree} 
              onChange={handleChange} 
            >
              <option value="Under Matric">Under Matric</option>
              <option value="Matric">Matric</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Bachelors">Bachelors</option>
              <option value="Master">Master</option>
              <option value="M.Phil">M.Phil</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          {formData.latestDegree !== 'Under Matric' && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Subject / Specialization</label>
              <input 
                type="text" 
                name="specialization"
                className="form-control" 
                value={formData.specialization} 
                onChange={handleChange} 
                placeholder="Enter subject or specialization"
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select 
              name="gender"
              className="form-control" 
              value={formData.gender} 
              onChange={handleChange} 
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Employee Status</label>
            <select 
              name="status"
              className="form-control" 
              value={formData.status} 
              onChange={handleChange} 
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LinkedIn ID</label>
            <input 
              type="text" 
              name="linkedinId"
              className="form-control" 
              value={formData.linkedinId} 
              placeholder="Enter LinkedIn profile link or ID"
              onChange={handleChange} 
            />
          </div>
        </div>

        {showDateFields && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input 
                type="date" 
                name="fromDate"
                className="form-control" 
                value={formData.fromDate} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">To Date</label>
              <input 
                type="date" 
                name="toDate"
                className="form-control mb-2" 
                value={formData.currentlyWorking ? '' : formData.toDate} 
                onChange={handleChange} 
                disabled={formData.currentlyWorking}
              />
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="currentlyWorking"
                  name="currentlyWorking"
                  checked={formData.currentlyWorking} 
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="currentlyWorking" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Currently working there/here
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-4">
          <button 
            type="submit" 
            className="btn-submit flex-1"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Submit Entry'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-4 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
