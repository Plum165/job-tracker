import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  KeyRound,
  User,
  Mail,
  GraduationCap,
  Briefcase,
  AtSign,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Layers,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { IdentifierType } from '../../backend/types/auth';
import { UserProfileView } from './UserProfileView';

export const EnterpriseAuthView: React.FC = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    activeSessionsCount,
    login,
    signup,
    logout,
    refreshTokens,
    revokeAllSessions,
    detectIdentifier,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [authSectionView, setAuthSectionView] = useState<'profile' | 'inspector'>('profile');
  
  // Login Form state
  const [identifier, setIdentifier] = useState('architect@enterprise.io');
  const [password, setPassword] = useState('Password123!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Signup Form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'EMPLOYEE' | 'ADMIN'>('STUDENT');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupEmployeeId, setSignupEmployeeId] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  // Action feedback states
  const [isRotating, setIsRotating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<'access' | 'refresh' | null>(null);

  const detectedType: IdentifierType = detectIdentifier(identifier);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMsg(null);
    try {
      await login(identifier, password);
      setLoginSuccessMsg(`Successfully authenticated via ${detectedType} identifier!`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
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
      setSignupError(err.message || 'Signup failed');
    }
  };

  const handleRotateTokens = async () => {
    setIsRotating(true);
    try {
      await refreshTokens();
    } catch (err: any) {
      setLoginError(err.message || 'Token rotation failed');
    } finally {
      setIsRotating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'access' | 'refresh') => {
    navigator.clipboard.writeText(text);
    setCopiedToken(type);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const fillDemoPreset = (presetIdentifier: string, label: string) => {
    setIdentifier(presetIdentifier);
    setPassword('Password123!');
    setLoginError(null);
    setLoginSuccessMsg(`Filled preset for ${label}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Full-Stack Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Dual-Token JWT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Multi-Identifier JWT Auth
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Login seamlessly using single-input Email, Student ID, Employee ID, or Username. Powered by strict regex inferring, Argon2/Bcrypt password verification, 15-minute access tokens, and 7-day rotated refresh tokens with replay attack revocation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/api/auth/demo-credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 min-h-[40px]"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>API Credentials Spec</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Auth Form vs JWT Security Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Multi-Identifier Auth Portal */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Form Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                    activeTab === 'login'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Single-Input Login
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                    activeTab === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Demo Presets Quick Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Quick Test Demo Accounts</span>
                    <span className="text-[10px] text-blue-500 lowercase">Password123!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => fillDemoPreset('architect@enterprise.io', 'Email')}
                      className="p-2 text-left bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        architect@enterprise.io
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoPreset('STU98765', 'Student ID')}
                      className="p-2 text-left bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Student ID
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        STU98765
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoPreset('EMP102', 'Employee ID')}
                      className="p-2 text-left bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Employee ID
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        EMP102
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoPreset('architect99', 'Username')}
                      className="p-2 text-left bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer group"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
                        <AtSign className="w-3 h-3" /> Username
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        architect99
                      </div>
                    </button>
                  </div>
                </div>

                {/* Single Identifier Input Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Login Identifier (Email, Student ID, Employee ID, or Username)
                    </label>
                    
                    {/* Live Regex Inferred Identifier Type Badge */}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      detectedType === 'EMAIL'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                        : detectedType === 'STUDENT_ID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : detectedType === 'EMPLOYEE_ID'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    }`}>
                      Detected: {detectedType}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {detectedType === 'EMAIL' && <Mail className="w-4 h-4 text-blue-500" />}
                      {detectedType === 'STUDENT_ID' && <GraduationCap className="w-4 h-4 text-emerald-500" />}
                      {detectedType === 'EMPLOYEE_ID' && <Briefcase className="w-4 h-4 text-purple-500" />}
                      {detectedType === 'USERNAME' && <AtSign className="w-4 h-4 text-amber-500" />}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. user@example.com, STU98765, EMP102, architect99"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{loginSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Authenticate Session</span>
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Morgan Vance"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. morgan_v"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="morgan@enterprise.io"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Role
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as any)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {signupRole === 'STUDENT' ? 'Student ID (Optional)' : 'Employee ID (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={signupRole === 'STUDENT' ? 'E.g. STU44012' : 'E.g. EMP302'}
                      value={signupRole === 'STUDENT' ? signupStudentId : signupEmployeeId}
                      onChange={(e) =>
                        signupRole === 'STUDENT'
                          ? setSignupStudentId(e.target.value)
                          : setSignupEmployeeId(e.target.value)
                      }
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                {signupError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{signupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors cursor-pointer min-h-[44px]"
                >
                  Create & Issue JWT Tokens
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Active Session & JWT Tokens Security Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    JWT Session & Security Inspector
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live decoded token payloads & dual-token rotation status
                  </p>
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full text-[10px] font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Authenticated
                  </span>
                  
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
                    title="Logout Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Authenticated User Status */}
            {isAuthenticated && user ? (
              <div className="space-y-4">
                {/* Mode Selector Header */}
                <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setAuthSectionView('profile')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authSectionView === 'profile'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    User Profile & Account Controls
                  </button>
                  <button
                    onClick={() => setAuthSectionView('inspector')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      authSectionView === 'inspector'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    JWT Tokens & Session Inspector
                  </button>
                </div>

                {authSectionView === 'profile' ? (
                  <UserProfileView />
                ) : (
                  <>
                {/* User Identity Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {user.fullName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                            Role: {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email} • Username: <strong className="text-slate-700 dark:text-slate-300">@{user.username}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRotateTokens}
                        disabled={isRotating}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-blue-500 shadow-2xs min-h-[36px]"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                        <span>Rotate Refresh Token</span>
                      </button>

                      <button
                        onClick={revokeAllSessions}
                        className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-rose-500 shadow-2xs min-h-[36px]"
                        title="Emergency Revoke All Refresh Tokens"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Revoke All</span>
                      </button>
                    </div>
                  </div>

                  {/* Identifier Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Email Identifier</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                        {user.email}
                      </div>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Student ID</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 truncate text-[11px]">
                        {user.studentId || 'N/A'}
                      </div>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Employee ID</div>
                      <div className="font-semibold text-purple-600 dark:text-purple-400 truncate text-[11px]">
                        {user.employeeId || 'N/A'}
                      </div>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">Active Sessions</div>
                      <div className="font-semibold text-blue-600 dark:text-blue-400 truncate text-[11px]">
                        {activeSessionsCount} active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tokens Inspector Cards */}
                {tokens && (
                  <div className="space-y-3">
                    
                    {/* Access Token Card */}
                    <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="font-bold text-blue-300">Access Token (Bearer Header)</span>
                          <span className="text-[10px] text-slate-400 font-mono">15m expiry</span>
                        </div>

                        <button
                          onClick={() => copyToClipboard(tokens.accessToken, 'access')}
                          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          {copiedToken === 'access' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy JWT
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2 bg-slate-950 font-mono text-[11px] text-slate-300 rounded border border-slate-800 break-all max-h-16 overflow-y-auto">
                        {tokens.accessToken}
                      </div>
                    </div>

                    {/* Refresh Token Card */}
                    <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="font-bold text-amber-300">Refresh Token (Rotated on Use)</span>
                          <span className="text-[10px] text-slate-400 font-mono">7-day expiry</span>
                        </div>

                        <button
                          onClick={() => copyToClipboard(tokens.refreshToken, 'refresh')}
                          className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          {copiedToken === 'refresh' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Refresh Token
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2 bg-slate-950 font-mono text-[11px] text-slate-300 rounded border border-slate-800 break-all max-h-16 overflow-y-auto">
                        {tokens.refreshToken}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
            ) : (
              <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Active JWT Session Detected
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Authenticate using any identifier preset on the left (Email, Student ID, Employee ID, or Username) to issue dual JWT tokens and inspect live payload claims.
                  </p>
                </div>
              </div>
            )}

            {/* Architecture Highlights */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Multi-Identifier Inferring
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Strict regex auto-detects input identifier type before hitting the repository layer.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Token Revocation Store
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Refreshed tokens are automatically revoked & tracked to protect against replay attacks.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mb-1">
                  <Layers className="w-3.5 h-3.5" /> Layered Architecture
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Controller, Service, Repository, and Auth Guards organized cleanly in TypeScript.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
