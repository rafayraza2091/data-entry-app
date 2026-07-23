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
      
      window.location.href = '/task';
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
    <div className="flex min-h-screen bg-[#F4F1E9]">
      {/* Left Side (Brand Panel) - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[44%] bg-[#172238] flex-col justify-between p-12 text-[#FFFEFA] relative overflow-hidden border-r border-[#D8D2C5]/20">
        <div className="z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[3px] bg-[#124D45] text-white font-bold text-lg flex items-center justify-center border border-[#B48632]">
            M
          </div>
          <span className="text-xl font-bold text-white uppercase tracking-wider">
            My<span className="text-[#B48632]">Academy</span>
          </span>
        </div>

        <div className="z-10 max-w-md my-auto">
          <div className="w-16 h-16 mb-6 rounded-[4px] bg-[#124D45]/30 border border-[#B48632]/40 flex items-center justify-center">
            <i className="fa-solid fa-graduation-cap text-3xl text-[#B48632]"></i>
          </div>
          <h2 className="text-3xl font-semibold mb-4 text-white leading-tight">
            Manage your academy, effortlessly.
          </h2>
          <p className="text-sm text-[#687286] leading-relaxed">
            A precise academic operations suite for syllabus management, student progress tracking, attendance records, and daily task workflows.
          </p>
        </div>

        <div className="z-10 pt-6 border-t border-white/10 text-[11px] text-[#687286]">
          Royal Academic Ledger Edition · Confidential Operations Desk
        </div>
      </div>

      {/* Right Side (Form Panel) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#FFFEFA]">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8 text-left">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-[2px] bg-[#124D45] text-white font-bold text-xs flex items-center justify-center border border-[#B48632]">
                M
              </div>
              <span className="text-base font-bold text-[#172238] uppercase tracking-wider">
                My<span className="text-[#B48632]">Academy</span>
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-[#172238] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[#687286] mt-1">Please sign in to access your dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] focus:ring-1 focus:ring-[#2463EB] outline-none transition-colors" 
                placeholder="Enter your username"
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] focus:ring-1 focus:ring-[#2463EB] outline-none transition-colors pr-10" 
                  placeholder="Enter your password"
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#687286] hover:text-[#172238] transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 bg-[#A33B3B]/10 border border-[#A33B3B]/30 rounded-[3px] flex items-center gap-2 text-[#A33B3B] text-xs font-medium">
                <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
                <span>{loginError}</span>
              </div>
            )}
            
            {loginSuccess && (
              <div className="p-2.5 bg-[#26705A]/10 border border-[#26705A]/30 rounded-[3px] flex items-center gap-2 text-[#26705A] text-xs font-medium">
                <i className="fa-solid fa-circle-check text-xs shrink-0"></i>
                <span>{loginSuccess}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-[36px] bg-[#124D45] hover:bg-[#1A6358] text-white font-semibold text-xs rounded-[3px] transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed mt-2" 
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
            
            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-[#D8D2C5]"></div>
              <span className="flex-shrink-0 mx-3 text-[#687286] text-xs">New to MyAcademy?</span>
              <div className="flex-grow border-t border-[#D8D2C5]"></div>
            </div>

            <button 
              type="button" 
              className="w-full h-[36px] bg-[#F4F1E9] hover:bg-[#F4F1E9]/80 border border-[#D8D2C5] text-[#172238] font-semibold text-xs rounded-[3px] transition-colors"
              onClick={() => setShowRegisterModal(true)}
            >
              Create an account
            </button>
          </form>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-[#0F181B]/60 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFEFA] rounded-[6px] border border-[#D8D2C5] shadow-[0_18px_55px_rgba(23,34,56,0.22)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-120">
            <div className="sticky top-0 bg-[#FFFEFA] border-b border-[#D8D2C5] px-6 py-3.5 flex items-center justify-between z-10 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-[#172238]">Create new account</h3>
                <p className="text-[11px] text-[#687286]">Account registration requires Owner review and approval</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-[3px] border border-[#D8D2C5] bg-[#F4F1E9] text-[#687286] hover:text-[#172238] transition-colors focus:outline-none"
              >
                <i className="fa-solid fa-xmark text-xs"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                
                {/* Stage 1: Identity & Contact */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-semibold uppercase text-[#687286] tracking-wider">
                    1. Identity & Contact Information
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regFirstName">First Name</label>
                      <input type="text" id="regFirstName" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regLastName">Last Name</label>
                      <input type="text" id="regLastName" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regEmail">Email Address</label>
                      <input type="email" id="regEmail" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                    </div>
                    
                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regContactNumber">Contact Number</label>
                      <input type="text" id="regContactNumber" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regContactNumber} onChange={(e) => setRegContactNumber(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regDesignation">Role / Designation</label>
                      <select id="regDesignation" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none cursor-pointer" required value={regDesignation} onChange={(e) => setRegDesignation(e.target.value)}>
                        <option value="" disabled>Select a role...</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Coordinator</option>
                      </select>
                    </div>

                    {/* Student guardian fields */}
                    {regDesignation === 'student' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regFatherName">Father's Name</label>
                          <input type="text" id="regFatherName" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" value={regFatherName} onChange={(e) => setRegFatherName(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regParentContact1">Parent Contact 1</label>
                          <input type="text" id="regParentContact1" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" value={regParentContact1} onChange={(e) => setRegParentContact1(e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regParentContact2">Parent Contact 2</label>
                          <input type="text" id="regParentContact2" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" value={regParentContact2} onChange={(e) => setRegParentContact2(e.target.value)} />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regAddress">Home Address</label>
                      <input type="text" id="regAddress" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regAddress} onChange={(e) => setRegAddress(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[#D8D2C5]/60" />

                {/* Stage 2: Account Credentials */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-semibold uppercase text-[#687286] tracking-wider">
                    2. Account Credentials & Security
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regUsername">Choose Username</label>
                      <input type="text" id="regUsername" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
                    </div>
                    
                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regPassword">Password</label>
                      <input type="password" id="regPassword" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-[11.5px] font-medium text-[#687286] mb-1" htmlFor="regConfirmPassword">Confirm Password</label>
                      <input type="password" id="regConfirmPassword" className="w-full h-[36px] px-3 bg-white text-[13px] font-medium text-[#172238] rounded-[3px] border border-[#D8D2C5] focus:border-[#2463EB] outline-none" required value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#F4F1E9] rounded-[3px] border border-[#D8D2C5]">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      required 
                      checked={regVerified} 
                      onChange={(e) => setRegVerified(e.target.checked)} 
                      className="mt-0.5 w-4 h-4 text-[#124D45] border-[#D8D2C5] rounded-[2px] focus:ring-[#2463EB]" 
                    />
                    <span className="text-xs text-[#172238] leading-relaxed">
                      I verify that the above information provided is true and accurate. I understand that access will remain unavailable until my registration is approved by the Owner.
                    </span>
                  </label>
                </div>

                {regError && (
                  <div className="p-2.5 bg-[#A33B3B]/10 border border-[#A33B3B]/30 rounded-[3px] flex items-center gap-2 text-[#A33B3B] text-xs font-medium">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
                    <span>{regError}</span>
                  </div>
                )}
                
                {regSuccess && (
                  <div className="p-2.5 bg-[#26705A]/10 border border-[#26705A]/30 rounded-[3px] flex items-center gap-2 text-[#26705A] text-xs font-medium">
                    <i className="fa-solid fa-circle-check text-xs shrink-0"></i>
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-[#D8D2C5] flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    className="h-[36px] px-4 bg-[#F4F1E9] border border-[#D8D2C5] hover:bg-[#F4F1E9]/80 text-[#172238] font-semibold text-xs rounded-[3px] transition-colors"
                    onClick={() => setShowRegisterModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="h-[36px] px-5 bg-[#124D45] hover:bg-[#1A6358] text-white font-semibold text-xs rounded-[3px] transition-colors flex items-center disabled:opacity-60 disabled:cursor-not-allowed" 
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Submitting...
                      </>
                    ) : (
                      'Submit Registration'
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
