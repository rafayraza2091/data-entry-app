'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
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
          confirmPassword: regConfirmPassword 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegSuccess('User created successfully! You can now log in.');
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegSuccess('');
        setRegFirstName('');
        setRegLastName('');
        setRegUsername('');
        setRegPassword('');
        setRegConfirmPassword('');
      }, 2000);
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
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowRegisterModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Create New User</h3>
            
            <form onSubmit={handleRegister}>
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

              <div className="form-group">
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

              {regError && <div className="status-message status-error" style={{ marginBottom: '1rem' }}>{regError}</div>}
              {regSuccess && <div className="status-message status-success" style={{ marginBottom: '1rem' }}>{regSuccess}</div>}

              <button type="submit" className="btn-submit" disabled={isRegistering} style={{ marginTop: '1rem' }}>
                {isRegistering ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
