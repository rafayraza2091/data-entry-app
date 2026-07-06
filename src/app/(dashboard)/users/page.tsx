'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [users, setUsers] = useState<{ students: any[], teachers: any[], admins: any[] }>({ students: [], teachers: [], admins: [] });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [category, setCategory] = useState<string>('');
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [schools, setSchools] = useState<{ id: number; name: string; branch: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    address: '',
    mobileNumber: '',
    email: '',
    fatherName: '',
    parentContact1: '',
    parentContact2: '',
    class: '',
    schoolName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });



  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchools();
    fetchClasses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (category) {
      setShowModal(true);
    }
  };

  const confirmSubmit = async () => {
    setShowModal(false);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { category, ...formData };
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create entry');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        secondName: '',
        address: '',
        mobileNumber: '',
        email: '',
        fatherName: '',
        parentContact1: '',
        parentContact2: '',
        class: '',
        schoolName: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
      setCategory('');
      fetchUsers(); // Refresh the list
      setView('list'); // Go back to list view
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !category;
  const inputStyle = { opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'text' };
  
  const openUserDetail = (user: any, cat: string) => {
    setSelectedUser(user);
    setSelectedCategory(cat);
  };

  const openEditModal = (user: any, cat: string) => {
    setEditFormData({
      id: user.id,
      firstName: user.firstName || '',
      secondName: user.secondName || '',
      address: user.address || '',
      mobileNumber: user.mobileNumber || '',
      email: user.email || '',
      fatherName: user.fatherName || '',
      parentContact1: user.parentContact1 || '',
      parentContact2: user.parentContact2 || '',
      className: user.className || '',
      schoolName: user.schoolName || '',
      otherInfo: user.otherInfo || ''
    });
    setSelectedCategory(cat);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = { category: selectedCategory, ...editFormData };
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to update');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error saving profile');
    } finally {
      setSavingEdit(false);
    }
  };

  const renderUserTable = (userList: any[], cat: string) => (
    <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</th>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact</th>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</th>
            {cat === 'student' && <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Parent</th>}
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr 
              key={user.id} 
              onClick={() => openUserDetail(user, cat)}
              style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '1rem', fontWeight: 500 }}>{user.firstName} {user.secondName}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.mobileNumber}</td>
              <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
              {cat === 'student' && <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.parentContact1 || '-'}</td>}
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(user, cat); }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem' }}
                  title="Edit Profile"
                >
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="form-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* ----------------- LIST VIEW ----------------- */}
      {view === 'list' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Users Management</h2>
            <button 
              onClick={() => { setView('add'); setSuccess(false); setError(null); }} 
              style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              + Add User
            </button>
          </div>

          {loadingUsers ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Teachers */}
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Teachers</h3>
                {users.teachers.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No teachers found.</p> : (
                  renderUserTable(users.teachers, 'teacher')
                )}
              </div>

              {/* Students */}
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Students</h3>
                {users.students.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No students found.</p> : (
                  renderUserTable(users.students, 'student')
                )}
              </div>

              {/* Admins */}
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Admins</h3>
                {users.admins.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No admins found.</p> : (
                  renderUserTable(users.admins, 'admin')
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- ADD VIEW ----------------- */}
      {view === 'add' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <button 
            onClick={() => setView('list')} 
            style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            ← Back to Users List
          </button>
          
          <div className="card">
            <h2 className="card-title">Add New Employee or Client</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-color)', opacity: 0.8 }}>
              Owner Portal - Select a category to begin adding a new record.
            </p>

            {error && <div className="error-message" style={{ marginBottom: '1rem', color: 'var(--error-color)' }}>{error}</div>}
            {success && <div className="success-message" style={{ marginBottom: '1rem', color: '#10b981' }}>Successfully added!</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
                
                {/* First Name & Second Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                    required={!isDisabled}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="secondName" className="form-label">Second Name</label>
                  <input
                    type="text"
                    id="secondName"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                    required={!isDisabled}
                  />
                </div>

                {/* Address */}
                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label htmlFor="address" className="form-label">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                    required={!isDisabled}
                  />
                </div>

                {/* Email & Mobile */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                    required={!isDisabled}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                    required={!isDisabled}
                  />
                </div>

                {/* Father Name */}
                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                  <label htmlFor="fatherName" className="form-label">Father Name</label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                  />
                </div>

                {/* Parent Contacts */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="parentContact1" className="form-label">Parent Contact 1</label>
                  <input
                    type="text"
                    id="parentContact1"
                    name="parentContact1"
                    value={formData.parentContact1}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="parentContact2" className="form-label">Parent Contact 2</label>
                  <input
                    type="text"
                    id="parentContact2"
                    name="parentContact2"
                    value={formData.parentContact2}
                    onChange={handleInputChange}
                    className="form-control"
                    disabled={isDisabled}
                    style={inputStyle}
                  />
                </div>

                {/* Student Specific Fields */}
                {category === 'student' && (
                  <>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="class" className="form-label">Class</label>
                      <select
                        id="class"
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      >
                        <option value="" disabled>Select class...</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="schoolName" className="form-label">School Name</label>
                      <select
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      >
                        <option value="" disabled>Select a school...</option>
                        {schools.map((school) => (
                          <option key={school.id} value={`${school.name} - ${school.branch}`}>
                            {school.name} ({school.branch})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Account Creation Fields (Mandatory) */}
                <div style={{ gridColumn: '1 / -1', marginTop: '1rem', padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Login Credentials</h3>
                  
                  <div className="form-row">
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label htmlFor="username" className="form-label">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-control"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-control"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-control"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                  </div>
                </div>


                <button
                  type="submit"
                  className="btn-primary"
                  style={{ gridColumn: '1 / -1', padding: '1rem', marginTop: '1rem', fontWeight: 600, opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  disabled={loading || isDisabled}
                >
                  {loading ? 'Processing...' : category ? `Add ${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- SUBMIT CONFIRMATION MODAL ----------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Details</h3>
              <p className="text-gray-500 text-sm mb-6">
                Please review the {category} details below before confirming.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-2 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-[1fr_2fr] gap-3 text-sm">
                  <strong className="text-gray-600">Category:</strong> <span className="capitalize text-gray-900">{category}</span>
                  <strong className="text-gray-600">Name:</strong> <span className="text-gray-900">{formData.firstName} {formData.secondName}</span>
                  <strong className="text-gray-600">Email:</strong> <span className="text-gray-900">{formData.email}</span>
                  <strong className="text-gray-600">Mobile:</strong> <span className="text-gray-900">{formData.mobileNumber}</span>
                  <strong className="text-gray-600">Address:</strong> <span className="text-gray-900">{formData.address}</span>
                  {formData.fatherName && <><strong className="text-gray-600">Father Name:</strong> <span className="text-gray-900">{formData.fatherName}</span></>}
                  {formData.parentContact1 && <><strong className="text-gray-600">Parent Contact 1:</strong> <span className="text-gray-900">{formData.parentContact1}</span></>}
                  {formData.parentContact2 && <><strong className="text-gray-600">Parent Contact 2:</strong> <span className="text-gray-900">{formData.parentContact2}</span></>}
                  {category === 'student' && (
                    <>
                      <strong className="text-gray-600">Class:</strong> <span className="text-gray-900">{formData.class}</span>
                      <strong className="text-gray-600">School:</strong> <span className="text-gray-900">{formData.schoolName}</span>
                    </>
                  )}
                  <div className="col-span-2 h-px bg-gray-200 my-2"></div>
                  <strong className="text-gray-600">Login Account:</strong> <span className="text-teal-600 font-semibold">Yes (Username: {formData.username})</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmSubmit}
                className="px-5 py-2 rounded-md font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- EDIT PROFILE MODAL ----------------- */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', animation: 'fadeIn 0.2s ease', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Edit {selectedCategory} Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={submitEdit} className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Second Name</label>
                <input type="text" name="secondName" value={editFormData.secondName} onChange={handleEditChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                <label className="form-label">Address</label>
                <input type="text" name="address" value={editFormData.address} onChange={handleEditChange} className="form-control" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email</label>
                <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} className="form-control" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mobile</label>
                <input type="text" name="mobileNumber" value={editFormData.mobileNumber} onChange={handleEditChange} className="form-control" />
              </div>

              {selectedCategory === 'student' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Father Name</label>
                    <input type="text" name="fatherName" value={editFormData.fatherName} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Parent Contact 1</label>
                    <input type="text" name="parentContact1" value={editFormData.parentContact1} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Parent Contact 2</label>
                    <input type="text" name="parentContact2" value={editFormData.parentContact2} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class</label>
                    <input type="text" name="className" value={editFormData.className} onChange={handleEditChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">School</label>
                    <input type="text" name="schoolName" value={editFormData.schoolName} onChange={handleEditChange} className="form-control" />
                  </div>
                </>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }} disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- USER DETAIL MODAL ----------------- */}
      {selectedUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '600px', animation: 'fadeIn 0.2s ease', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{selectedUser.firstName} {selectedUser.secondName}</h3>
                <span style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedCategory}
                </span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', fontSize: '1rem' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong> <span>{selectedUser.email}</span>
                <strong style={{ color: 'var(--text-secondary)' }}>Mobile:</strong> <span>{selectedUser.mobileNumber}</span>
                <strong style={{ color: 'var(--text-secondary)' }}>Address:</strong> <span>{selectedUser.address}</span>
                
                {selectedUser.fatherName && <><strong style={{ color: 'var(--text-secondary)' }}>Father Name:</strong> <span>{selectedUser.fatherName}</span></>}
                {selectedUser.parentContact1 && <><strong style={{ color: 'var(--text-secondary)' }}>Parent Contact 1:</strong> <span>{selectedUser.parentContact1}</span></>}
                {selectedUser.parentContact2 && <><strong style={{ color: 'var(--text-secondary)' }}>Parent Contact 2:</strong> <span>{selectedUser.parentContact2}</span></>}
                
                {selectedCategory === 'student' && (
                  <>
                    <strong style={{ color: 'var(--text-secondary)' }}>Class:</strong> <span>{selectedUser.className}</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>School:</strong> <span>{selectedUser.schoolName}</span>
                  </>
                )}
                
                {selectedUser.otherInfo && <><strong style={{ color: 'var(--text-secondary)' }}>Other Info:</strong> <span style={{ whiteSpace: 'pre-wrap' }}>{selectedUser.otherInfo}</span></>}
                
                <strong style={{ color: 'var(--text-secondary)' }}>Added On:</strong> <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setSelectedUser(null)}
                className="btn-primary"
                style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
