'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // New additional fields
  const [regEmail, setRegEmail] = useState('');
  const [regContactNumber, setRegContactNumber] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regFatherName, setRegFatherName] = useState('');
  const [regParentContact1, setRegParentContact1] = useState('');
  const [regParentContact2, setRegParentContact2] = useState('');
  const [regVerified, setRegVerified] = useState(false);

  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      
      window.location.href = '/';
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsRegistering(true);

    try {
      if (regPassword !== regConfirmPassword) {
        throw new Error('Passwords do not match');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: regFirstName,
          lastName: regLastName,
          username: regUsername, 
          password: regPassword, 
          confirmPassword: regConfirmPassword,
          email: regEmail,
          contactNumber: regContactNumber,
          address: regAddress,
          designation: regDesignation,
          fatherName: regFatherName,
          parentContact1: regParentContact1,
          parentContact2: regParentContact2
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setLoginSuccess(data.message || 'Registration submitted for approval.');
      setShowRegisterModal(false);
      setRegSuccess('');
      setRegFirstName('');
      setRegLastName('');
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegEmail('');
      setRegContactNumber('');
      setRegAddress('');
      setRegDesignation('');
      setRegFatherName('');
      setRegParentContact1('');
      setRegParentContact2('');
      setRegVerified(false);
    } catch (error: any) {
      setRegError(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel animate-slide-up" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textAlign: 'center', marginBottom: '1.5rem' }}>
          Welcome to the login page of MyAcademy Data Entry.
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {loginError && <div className="status-message status-error" style={{ marginBottom: '1rem' }}>{loginError}</div>}
          {loginSuccess && <div className="status-message status-success" style={{ marginBottom: '1rem' }}>{loginSuccess}</div>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-submit" disabled={isLoggingIn} style={{ flex: 1 }}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
            <button 
              type="button" 
              className="btn-submit" 
              style={{ flex: 1, backgroundColor: '#475569' }}
              onClick={() => setShowRegisterModal(true)}
            >
              Create User
            </button>
          </div>
        </form>
      </div>

      {showRegisterModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ maxWidth: '800px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowRegisterModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Create New User</h3>
            
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                
                {/* Row 1 */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regFirstName">First Name</label>
                  <input 
                    type="text" 
                    id="regFirstName" 
                    className="form-control" 
                    required 
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="regLastName">Second Name (Last Name)</label>
                  <input 
                    type="text" 
                    id="regLastName" 
                    className="form-control" 
                    required 
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                </div>

                {/* Row 2 - Email full width */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="regEmail">Email Address</label>
                  <input 
                    type="email" 
                    id="regEmail" 
                    className="form-control" 
                    required 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                
                {/* Row 3 - Contact and Designation */}
                <div className="form-group">
                  <label className="form-label" htmlFor="regContactNumber">Contact Number</label>
                  <input 
                    type="text" 
                    id="regContactNumber" 
                    className="form-control" 
                    required 
                    value={regContactNumber}
                    onChange={(e) => setRegContactNumber(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="regDesignation">Designation</label>
                  <select 
                    id="regDesignation" 
                    className="form-control" 
                    required 
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                  >
                    <option value="" disabled>None</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Student specific fields */}
                {regDesignation === 'student' && (
                  <>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label" htmlFor="regFatherName">Father's Name</label>
                      <input 
                        type="text" 
                        id="regFatherName" 
                        className="form-control" 
                        value={regFatherName}
                        onChange={(e) => setRegFatherName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="regParentContact1">Parent Contact 1</label>
                      <input 
                        type="text" 
                        id="regParentContact1" 
                        className="form-control" 
                        value={regParentContact1}
                        onChange={(e) => setRegParentContact1(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="regParentContact2">Parent Contact 2</label>
                      <input 
                        type="text" 
                        id="regParentContact2" 
                        className="form-control" 
                        value={regParentContact2}
                        onChange={(e) => setRegParentContact2(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Row X - Address full width */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="regAddress">Address</label>
                  <input 
                    type="text" 
                    id="regAddress" 
                    className="form-control" 
                    required 
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                  />
                </div>
              </div>

              <hr style={{ margin: '2rem 0', borderColor: '#334155' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: '#e2e8f0' }}>Account Details</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="regUsername">Username</label>
                  <input 
                    type="text" 
                    id="regUsername" 
                    className="form-control" 
                    required 
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="regPassword">Password</label>
                  <input 
                    type="password" 
                    id="regPassword" 
                    className="form-control" 
                    required 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="regConfirmPassword">Confirm Password</label>
                  <input 
                    type="password" 
                    id="regConfirmPassword" 
                    className="form-control" 
                    required 
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    required 
                    checked={regVerified} 
                    onChange={(e) => setRegVerified(e.target.checked)} 
                    style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.1rem' }} 
                  />
                  <span style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    I verify that the above information provided is true. I agree to the policies of the company.
                  </span>
                </label>
              </div>

              {regError && <div className="status-message status-error" style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>{regError}</div>}
              {regSuccess && <div className="status-message status-success" style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>{regSuccess}</div>}

              <button type="submit" className="btn-submit" disabled={isRegistering} style={{ marginTop: '1.5rem', width: '100%' }}>
                {isRegistering ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
