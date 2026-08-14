import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CalendarClock,
  Lock,
  Mail,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { validateLoginForm, validateSignupForm } from '../../lib/authValidation';

type AuthView = 'welcome' | 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const { login, signup, isLoading } = useAuth();

  const [view, setView] = useState<AuthView>('welcome');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'STUDENT' | 'EMPLOYEE' | 'ADMIN'>('STUDENT');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupEmployeeId, setSignupEmployeeId] = useState('');
  const [signupError, setSignupError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const validationMessage = validateLoginForm(identifier, password);
    if (validationMessage) {
      setLoginError(validationMessage);
      return;
    }

    try {
      await login(identifier, password);
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    const validationMessage = validateSignupForm({
      fullName: signupFullName,
      email: signupEmail,
      username: signupUsername,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });

    if (validationMessage) {
      setSignupError(validationMessage);
      return;
    }

    try {
      await signup({
        fullName: signupFullName,
        email: signupEmail,
        username: signupUsername,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        role: signupRole,
        studentId: signupRole === 'STUDENT' ? signupStudentId || undefined : undefined,
        employeeId: signupRole !== 'STUDENT' ? signupEmployeeId || undefined : undefined,
      });
    } catch (err: any) {
      setSignupError(err?.message || 'Account registration failed');
    }
  };

  const goBack = () => {
    setLoginError(null);
    setSignupError(null);
    setView('welcome');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <section className="lg:col-span-2 bg-slate-950 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center border border-blue-500">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">
                    Opportunity Hub
                  </h1>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Graduate program workspace
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Find job opportunities, save roles you care about, manage contacts, and track interviews and deadlines in one focused workspace.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Browse and save job opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Keep personal contacts organized</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Track interviews and deadline information</span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-center bg-slate-900">
            {view === 'welcome' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Get started</h3>
                  <p className="text-sm text-slate-400">
                    Create an account or log in to continue to your workspace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setView('signup')}
                    className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="min-h-[52px] rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              </div>
            )}

            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Log in</h3>
                  <p className="text-xs text-slate-400">
                    Enter your account details to access your workspace.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email or username</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter email or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Password</label>
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
                  <span>{isLoading ? 'Logging in...' : 'Log In'}</span>
                </button>
              </form>
            )}

            {view === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Sign up</h3>
                  <p className="text-xs text-slate-400">
                    Create a profile to start managing your opportunities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Full name</label>
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
                    <label className="text-xs font-bold text-slate-300">Username</label>
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
                  <label className="text-xs font-bold text-slate-300">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="sam@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Role</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as 'STUDENT' | 'EMPLOYEE' | 'ADMIN')}
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">
                      {signupRole === 'STUDENT' ? 'Student ID (optional)' : 'Employee ID (optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder={signupRole === 'STUDENT' ? 'Optional student ID' : 'Optional employee ID'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Confirm password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
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
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors cursor-pointer min-h-[44px]"
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
