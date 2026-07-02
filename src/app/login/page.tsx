'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen bg-lightgray">
      {/* Left Side (Illustration) - Hidden on mobile */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary to-primaryDark flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="z-10 text-center max-w-lg">
          {/* We use a placeholder div since we don't have the actual image asset */}
          <div className="w-64 h-64 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl">
            <i className="fa-solid fa-graduation-cap text-8xl text-white"></i>
          </div>
          <h2 className="text-4xl font-bold mb-4">Manage your academy, effortlessly.</h2>
          <p className="text-lg text-primary-50 opacity-90">
            A comprehensive solution for student records, syllabus tracking, and daily task management.
          </p>
        </div>
      </div>

      {/* Right Side (Form Panel) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <i className="fa-solid fa-school text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-headingGray">
              Welcome to <span className="text-primary">MyAcademy</span>
            </h1>
            <p className="text-subtextGray mt-2">Please sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                className="w-full px-4 py-2.5 rounded-md border border-borderGray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                placeholder="Enter your username"
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="w-full px-4 py-2.5 rounded-md border border-borderGray focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors pr-10" 
                  placeholder="Enter your password"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtextGray hover:text-primary transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-md flex items-start text-danger text-sm">
                <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2"></i>
                <span>{loginError}</span>
              </div>
            )}
            
            {loginSuccess && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-md flex items-start text-success text-sm">
                <i className="fa-solid fa-circle-check mt-0.5 mr-2"></i>
                <span>{loginSuccess}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-borderGray"></div>
              <span className="flex-shrink-0 mx-4 text-subtextGray text-sm">New to MyAcademy?</span>
              <div className="flex-grow border-t border-borderGray"></div>
            </div>

            <button 
              type="button" 
              className="w-full bg-white border border-borderGray hover:bg-lightgray text-headingGray font-medium py-2.5 rounded-md transition-colors"
              onClick={() => setShowRegisterModal(true)}
            >
              Create an Account
            </button>
          </form>
        </div>
      </div>

      {/* Registration Modal - Preserving existing fields but styling with Tailwind */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-headingGray/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-[fadeIn_0.2s_ease]">
            <div className="sticky top-0 bg-white border-b border-borderGray px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-headingGray">Create New User</h3>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-lightgray text-subtextGray transition-colors focus:outline-none"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Row 1 */}
                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regFirstName">First Name</label>
                    <input type="text" id="regFirstName" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regLastName">Last Name</label>
                    <input type="text" id="regLastName" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
                  </div>

                  {/* Row 2 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regEmail">Email Address</label>
                    <input type="email" id="regEmail" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  </div>
                  
                  {/* Row 3 */}
                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regContactNumber">Contact Number</label>
                    <input type="text" id="regContactNumber" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regContactNumber} onChange={(e) => setRegContactNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regDesignation">Role/Designation</label>
                    <select id="regDesignation" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none bg-white" required value={regDesignation} onChange={(e) => setRegDesignation(e.target.value)}>
                      <option value="" disabled>Select a role...</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Student specific fields */}
                  {regDesignation === 'student' && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regFatherName">Father's Name</label>
                        <input type="text" id="regFatherName" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" value={regFatherName} onChange={(e) => setRegFatherName(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regParentContact1">Parent Contact 1</label>
                        <input type="text" id="regParentContact1" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" value={regParentContact1} onChange={(e) => setRegParentContact1(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regParentContact2">Parent Contact 2</label>
                        <input type="text" id="regParentContact2" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" value={regParentContact2} onChange={(e) => setRegParentContact2(e.target.value)} />
                      </div>
                    </>
                  )}

                  {/* Row X */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regAddress">Home Address</label>
                    <input type="text" id="regAddress" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
                  </div>
                </div>

                <div className="my-8 flex items-center">
                  <div className="flex-grow border-t border-borderGray"></div>
                  <span className="flex-shrink-0 mx-4 text-headingGray font-semibold text-sm uppercase tracking-wider">Account Credentials</span>
                  <div className="flex-grow border-t border-borderGray"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regUsername">Choose Username</label>
                    <input type="text" id="regUsername" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regPassword">Password</label>
                    <input type="password" id="regPassword" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-headingGray mb-1.5" htmlFor="regConfirmPassword">Confirm Password</label>
                    <input type="password" id="regConfirmPassword" className="w-full px-3 py-2 rounded-md border border-borderGray focus:border-primary outline-none" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-kanbanBg2 rounded-md border border-borderGray">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      required 
                      checked={regVerified} 
                      onChange={(e) => setRegVerified(e.target.checked)} 
                      className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" 
                    />
                    <span className="text-sm text-subtextGray">
                      I verify that the above information provided is true. I agree to the policies of the company.
                    </span>
                  </label>
                </div>

                {regError && (
                  <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-md flex items-start text-danger text-sm">
                    <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2"></i>
                    <span>{regError}</span>
                  </div>
                )}
                
                {regSuccess && (
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-md flex items-start text-success text-sm">
                    <i className="fa-solid fa-circle-check mt-0.5 mr-2"></i>
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-borderGray flex justify-end gap-3">
                  <button 
                    type="button" 
                    className="px-5 py-2.5 bg-white border border-borderGray hover:bg-lightgray text-headingGray font-medium rounded-md transition-colors"
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-primary hover:bg-primaryDark text-white font-medium rounded-md transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
