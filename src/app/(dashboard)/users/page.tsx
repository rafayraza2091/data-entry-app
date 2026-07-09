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
  const [subjectsList, setSubjectsList] = useState<{ id: number; name: string }[]>([]);
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
    subjects: [] as string[],
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
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjectsList(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchools();
    fetchClasses();
    fetchSubjects();
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
        subjects: [],
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
      subjects: user.subjects || [],
      otherInfo: user.otherInfo || ''
    });
    setSelectedCategory(cat);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubjectAdd = (e: React.ChangeEvent<HTMLSelectElement>, isEdit: boolean) => {
    const subject = e.target.value;
    if (!subject) return;

    let subjectsToAdd: string[] = [];
    if (subject === 'All Subjects Junior') {
      subjectsToAdd = ["English", "Geography", "History", "Islamiat", "Mathematics", "Urdu", "Quran Translation", "Science"];
    } else {
      subjectsToAdd = [subject];
    }

    if (isEdit) {
      setEditFormData((prev: any) => {
        const currentSubjects = prev.subjects || [];
        const newSubjects = subjectsToAdd.filter(s => !currentSubjects.includes(s));
        if (newSubjects.length > 0) {
          return { ...prev, subjects: [...currentSubjects, ...newSubjects] };
        }
        return prev;
      });
    } else {
      setFormData((prev) => {
        const currentSubjects = prev.subjects || [];
        const newSubjects = subjectsToAdd.filter(s => !currentSubjects.includes(s));
        if (newSubjects.length > 0) {
          return { ...prev, subjects: [...currentSubjects, ...newSubjects] };
        }
        return prev;
      });
    }
    e.target.value = "";
  };

  const handleSubjectRemove = (subject: string, isEdit: boolean) => {
    if (isEdit) {
      setEditFormData((prev: any) => ({ ...prev, subjects: (prev.subjects || []).filter((s: string) => s !== subject) }));
    } else {
      setFormData((prev) => ({ ...prev, subjects: prev.subjects.filter((s: string) => s !== subject) }));
    }
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto mx-4 md:mx-8 mb-8">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-200 bg-teal-50 text-teal-700 uppercase text-xs tracking-wider">
            <th className="p-2 md:p-4 font-semibold">Name</th>
            <th className="p-2 md:p-4 font-semibold">Contact</th>
            <th className="p-2 md:p-4 font-semibold">Email</th>
            {cat === 'student' && <th className="p-2 md:p-4 font-semibold">Parent</th>}
            <th className="p-2 md:p-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr 
              key={user.id} 
              onClick={() => openUserDetail(user, cat)}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="p-2 md:p-4 text-sm font-medium text-gray-800">{user.firstName} {user.secondName}</td>
              <td className="p-2 md:p-4 text-sm text-gray-600">{user.mobileNumber}</td>
              <td className="p-2 md:p-4 text-sm text-gray-600">{user.email}</td>
              {cat === 'student' && <td className="p-2 md:p-4 text-sm text-gray-600">{user.parentContact1 || '-'}</td>}
              <td className="p-2 md:p-4 text-sm text-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(user, cat); }}
                  className="text-gray-400 hover:text-teal-600 transition-colors p-1"
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
    <main className="w-auto pb-8 -mt-4 md:-mt-8 -mx-4 md:-mx-8" style={{ maxWidth: 'none' }}>
      
      {/* ----------------- LIST VIEW ----------------- */}
      {view === 'list' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="py-2 px-4 md:px-8 mb-6" style={{ backgroundColor: '#0f766e' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white whitespace-nowrap">Users Directory</h2>
              <button 
                onClick={() => { setView('add'); setSuccess(false); setError(null); }} 
                className="bg-white text-teal-700 hover:bg-teal-50 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm"
              >
                + Add User
              </button>
            </div>
          </div>

          {loadingUsers ? (
            <p className="text-center text-gray-500 py-8">Loading users...</p>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {/* Teachers */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mx-4 md:mx-8 mb-3">Teachers</h3>
                {users.teachers.length === 0 ? <p className="text-gray-500 mx-4 md:mx-8 mb-6">No teachers found.</p> : (
                  renderUserTable(users.teachers, 'teacher')
                )}
              </div>

              {/* Students */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mx-4 md:mx-8 mb-3">Students</h3>
                {users.students.length === 0 ? <p className="text-gray-500 mx-4 md:mx-8 mb-6">No students found.</p> : (
                  renderUserTable(users.students, 'student')
                )}
              </div>

              {/* Admins */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mx-4 md:mx-8 mb-3">Admins</h3>
                {users.admins.length === 0 ? <p className="text-gray-500 mx-4 md:mx-8 mb-6">No admins found.</p> : (
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
          <div className="py-2 px-4 md:px-8 mb-6" style={{ backgroundColor: '#0f766e' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white whitespace-nowrap">Add New User</h2>
              <button 
                onClick={() => setView('list')} 
                className="bg-teal-800 text-teal-100 hover:bg-teal-900 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors"
              >
                ← Back to List
              </button>
            </div>
          </div>
          
          <div className="mx-4 md:mx-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Employee or Client Details</h3>
            <p className="text-gray-500 text-sm mb-6">Owner Portal - Select a category to begin adding a new record.</p>

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
                    <div className="form-group col-span-1 md:col-span-2" style={{ marginBottom: 0 }}>
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
                    <div className="form-group col-span-1 md:col-span-2" style={{ marginBottom: 0 }}>
                      <label htmlFor="subjects" className="form-label">Assigned Subjects</label>
                      <select
                        id="subjects"
                        name="subjects"
                        onChange={(e) => handleSubjectAdd(e, false)}
                        className="form-control mb-2"
                        defaultValue=""
                      >
                        <option value="" disabled>Select subject to assign...</option>
                        <option value="All Subjects Junior" className="font-semibold text-teal-600">All Subjects Junior</option>
                        {subjectsList
                          .filter(sub => !formData.subjects.includes(sub.name))
                          .map((sub) => (
                          <option key={sub.id} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                      
                      {formData.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.subjects.map(subject => (
                            <span 
                              key={subject} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                            >
                              {subject}
                              <button
                                type="button"
                                onClick={() => handleSubjectRemove(subject, false)}
                                className="ml-1.5 inline-flex items-center justify-center text-teal-400 hover:text-teal-900 focus:outline-none"
                              >
                                <span className="sr-only">Remove subject</span>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Account Creation Fields (Mandatory) */}
                <div className="col-span-1 md:col-span-2 mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Login Credentials</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group col-span-1 md:col-span-2 mb-0">
                      <label htmlFor="username" className="form-label font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-control bg-white border-gray-300"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="password" className="form-label font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-control bg-white border-gray-300"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="confirmPassword" className="form-label font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-control bg-white border-gray-300"
                        disabled={isDisabled}
                        style={inputStyle}
                        required={!isDisabled}
                      />
                    </div>
                  </div>
                </div>


                <button
                  type="submit"
                  className="col-span-1 md:col-span-2 px-6 py-3 mt-4 text-white font-semibold rounded-lg shadow-sm transition-colors"
                  style={{ 
                    backgroundColor: isDisabled ? '#9ca3af' : '#0d9488', 
                    opacity: isDisabled ? 0.8 : 1, 
                    cursor: isDisabled ? 'not-allowed' : 'pointer' 
                  }}
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
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl relative" style={{ width: '90%', maxWidth: '600px', animation: 'fadeIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">Edit {selectedCategory} Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ background: 'transparent', border: 'none', fontSize: '1.75rem', cursor: 'pointer', lineHeight: 1 }}
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
                  <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                    <label className="form-label">Assigned Subjects</label>
                    <select
                      id="editSubjects"
                      name="editSubjects"
                      onChange={(e) => handleSubjectAdd(e, true)}
                      className="form-control mb-2"
                      defaultValue=""
                    >
                      <option value="" disabled>Select subject to assign...</option>
                      <option value="All Subjects Junior" className="font-semibold text-teal-600">All Subjects Junior</option>
                      {subjectsList
                        .filter(sub => !(editFormData.subjects || []).includes(sub.name))
                        .map((sub) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                    
                    {(editFormData.subjects || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(editFormData.subjects || []).map((subject: string) => (
                          <span 
                            key={subject} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                          >
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleSubjectRemove(subject, true)}
                              className="ml-1.5 inline-flex items-center justify-center text-teal-400 hover:text-teal-900 focus:outline-none"
                            >
                              <span className="sr-only">Remove subject</span>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors font-medium" disabled={savingEdit}>
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
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl relative" style={{ width: '90%', maxWidth: '600px', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{selectedUser.firstName} {selectedUser.secondName}</h3>
                <span style={{ display: 'inline-block', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedCategory}
                </span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ background: 'transparent', border: 'none', fontSize: '1.75rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-100" style={{ padding: '1.5rem', borderRadius: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
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
                    {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                      <>
                        <strong style={{ color: 'var(--text-secondary)' }}>Subjects:</strong> 
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.subjects.map((subject: string) => (
                            <span 
                              key={subject} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
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
                className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
