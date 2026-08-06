import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  GraduationCap,
  Briefcase,
  AtSign,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase as BriefcaseIcon,
  Zap,
  KeyRound,
  Building2,
  Clock,
  Layers,
} from 'lucide-react';
import { IdentifierType } from '../../backend/types/auth';

export const AuthPage: React.FC = () => {
  const { login, signup, isLoading, detectIdentifier } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('SMSMOE006');
  const [password, setPassword] = useState('1234');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'EMPLOYEE' | 'ADMIN'>('STUDENT');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupEmployeeId, setSignupEmployeeId] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  const detectedType: IdentifierType = detectIdentifier(identifier);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleInstantDemoLogin = async () => {
    setIdentifier('SMSMOE006');
    setPassword('1234');
    setLoginError(null);
    try {
      await login('SMSMOE006', '1234');
    } catch (err: any) {
      setLoginError(err.message || 'Demo login failed');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    try {
      await signup({
        fullName: signupFullName,
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
        role: signupRole,
        studentId: signupStudentId || undefined,
        employeeId: signupEmployeeId || undefined,
      });
    } catch (err: any) {
      setSignupError(err.message || 'Account registration failed');
    }
  };

  const fillPreset = (idVal: string, passVal: string) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Branding & Demo Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <BriefcaseIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">
                  Opportunity Hub
                </h1>
                <p className="text-[11px] text-blue-300/80 font-medium mt-0.5">
                  Enterprise Shared Workspace
                </p>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-amber-400" /> Multi-Identifier Auth Enabled
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Sign in to access your jobs, contacts & deadline alerts.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in using your Email, Student ID, Employee ID, or Username. Uses multi-identifier regex inferring and dual JWT tokens.
              </p>
            </div>

            {/* Highlighted Demo Notice Box */}
            <div className="p-4 bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 rounded-2xl space-y-2.5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Demo Account
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  No Backend Needed
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Username:</span>
                  <strong className="text-amber-300">SMSMOE006</strong>
                </div>
                <div className="flex items-center justify-between font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Password:</span>
                  <strong className="text-emerald-300">1234</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group min-h-[40px]"
              >
                <span>Instant One-Click Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="pt-6 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Job Opportunity Shared Catalog & Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Personal Contacts & Interview Deadline Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Single-Input Email / Student ID / Employee ID / Username</span>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Login / Signup Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6 bg-slate-900">
          
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[42px] ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[42px] ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Welcome back</h3>
                <p className="text-xs text-slate-400">
                  Enter your credentials below to authenticate your session.
                </p>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Identifier (Email, Student ID, Employee ID, Username)
                  </label>
                  
                  {/* Live Regex Detection Pill */}
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    detectedType === 'EMAIL'
                      ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                      : detectedType === 'STUDENT_ID'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                      : detectedType === 'EMPLOYEE_ID'
                      ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                      : 'bg-amber-950 text-amber-300 border-amber-500/40'
                  }`}>
                    Detected: {detectedType}
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {detectedType === 'EMAIL' && <Mail className="w-4 h-4 text-blue-400" />}
                    {detectedType === 'STUDENT_ID' && <GraduationCap className="w-4 h-4 text-emerald-400" />}
                    {detectedType === 'EMPLOYEE_ID' && <Briefcase className="w-4 h-4 text-purple-400" />}
                    {detectedType === 'USERNAME' && <AtSign className="w-4 h-4 text-amber-400" />}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username, Email, Student ID, or Employee ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Preset Selector Chips */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Preset Accounts:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillPreset('SMSMOE006', '1234')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      identifier === 'SMSMOE006'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    SMSMOE006 (1234)
                  </button>

                  <button
                    type="button"
                    onClick={() => fillPreset('architect99', 'Password123!')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      identifier === 'architect99'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    architect99 (Password123!)
                  </button>

                  <button
                    type="button"
                    onClick={() => fillPreset('STU98765', 'Password123!')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      identifier === 'STU98765'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    STU98765 (Password123!)
                  </button>

                  <button
                    type="button"
                    onClick={() => fillPreset('EMP102', 'Password123!')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      identifier === 'EMP102'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    EMP102 (Password123!)
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Workspace</span>
              </button>

            </form>
          )}

          {/* SIGNUP TAB */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Create an Account</h3>
                <p className="text-xs text-slate-400">
                  Register a new profile to start managing job opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Sam Rivera"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. sam_r"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="sam@enterprise.io"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as any)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    {signupRole === 'STUDENT' ? 'Student ID (Optional)' : 'Employee ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={signupRole === 'STUDENT' ? 'E.g. STU50012' : 'E.g. EMP401'}
                    value={signupRole === 'STUDENT' ? signupStudentId : signupEmployeeId}
                    onChange={(e) =>
                      signupRole === 'STUDENT'
                        ? setSignupStudentId(e.target.value)
                        : setSignupEmployeeId(e.target.value)
                    }
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 4 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              {signupError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{signupError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer min-h-[44px]"
              >
                Create Account & Enter Workspace
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
