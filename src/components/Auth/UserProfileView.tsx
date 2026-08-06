import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../backend/types/auth';
import { UserPreferences, UserAuditLog } from '../../backend/types/user';
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  AtSign,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Trash2,
  UserCog,
  Settings,
  Sparkles,
  Lock,
  Globe,
  Bell,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, tokens, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'audit' | 'admin'>('profile');

  // Edit Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences Form State
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [displayMode, setDisplayMode] = useState<'compact' | 'comfortable'>('comfortable');
  const [prefsMsg, setPrefsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Admin User Directory State
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminMsg, setAdminMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account Deletion Confirmation Modal / Field
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Sync state when user updates
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch preferences & initial data
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!tokens?.accessToken) return;
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          const prefs: UserPreferences = json.data.parsedPreferences || {};
          if (prefs.theme) setTheme(prefs.theme);
          if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
          if (prefs.displayMode) setDisplayMode(prefs.displayMode);
        }
      } catch (e) {
        // Fallback
      }
    };

    fetchProfileDetails();
  }, [tokens]);

  // Fetch Audit Logs when tab is active
  useEffect(() => {
    if (activeTab === 'audit' && tokens?.accessToken) {
      setIsLoadingLogs(true);
      fetch('/api/users/me/audit-logs', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAuditLogs(json.data);
        })
        .catch(() => {})
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab, tokens]);

  // Fetch Users list for Admin tab
  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'ADMIN' && tokens?.accessToken) {
      setIsLoadingUsers(true);
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setUserList(json.data);
        })
        .catch(() => {})
        .finally(() => setIsLoadingUsers(false));
    }
  }, [activeTab, user?.role, tokens]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          bio,
          avatarUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update profile');

      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Error saving profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to change password');

      setPasswordMsg({ type: 'success', text: 'Password changed successfully! Active sessions rotated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error changing password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async () => {
    setPrefsMsg(null);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          preferences: {
            theme,
            emailNotifications,
            displayMode,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update preferences');

      setPrefsMsg({ type: 'success', text: 'User preferences saved successfully!' });
    } catch (err: any) {
      setPrefsMsg({ type: 'error', text: err.message || 'Error saving preferences' });
    }
  };

  // Handle Admin Role Change
  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    setAdminMsg(null);
    try {
      const res = await fetch(`/api/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update role');

      setAdminMsg({ type: 'success', text: `Role updated for user to ${newRole}` });
      // Refresh list
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setAdminMsg({ type: 'error', text: err.message || 'Error updating role' });
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setIsDeletingAccount(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Account deletion failed');

      await logout();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  // Pre-defined avatar options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/80 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center border-2 border-blue-400/80 shadow-md">
                {fullName ? fullName.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">{fullName || 'User Profile'}</h1>
              <span className="px-2.5 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-black uppercase tracking-wider rounded-md">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>@{username}</span>
              <span>•</span>
              <span>{email}</span>
            </p>
            {user?.studentId && (
              <span className="inline-block text-[11px] font-semibold text-emerald-400 mt-1">
                Student ID: {user.studentId}
              </span>
            )}
            {user?.employeeId && (
              <span className="inline-block text-[11px] font-semibold text-amber-400 mt-1 ml-2">
                Employee ID: {user.employeeId}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Account ID:</span>
          <code className="px-2.5 py-1 bg-slate-800 text-blue-300 font-mono text-xs rounded-lg border border-slate-700">
            {user?.id}
          </code>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit History</span>
        </button>

        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-white hover:bg-amber-950/40 border border-amber-800/60'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Role Directory (Admin)</span>
          </button>
        )}
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Personal Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your account details and profile presentation.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-blue-500 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Avatar Preset Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Avatar Selection</label>
            <div className="flex flex-wrap items-center gap-3">
              {avatarOptions.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    avatarUrl === url ? 'border-blue-500 scale-105 shadow-md' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-12 h-12 object-cover" />
                </button>
              ))}
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Username</label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-300">Bio / Notes</label>
              <textarea
                rows={3}
                placeholder="Brief description about your background, career goals, or project interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Change Password */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                  Change Password
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Requires current password verification. Changing password automatically invalidates all existing sessions.
                </p>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-blue-500 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </form>

          {/* Danger Zone: Delete Account */}
          <div className="bg-rose-950/30 border border-rose-900/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>Danger Zone: Account Deletion</span>
            </div>
            <p className="text-xs text-rose-200/80">
              Permanently delete your user account and revoke all active refresh tokens. This action is irreversible.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <input
                type="password"
                required
                placeholder="Enter password to confirm account deletion..."
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-rose-800/80 text-white text-xs rounded-xl focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={isDeletingAccount}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-rose-500 shadow-sm shrink-0"
              >
                {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                User Preferences
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize layout density, theme mode, and notification alerts.
              </p>
            </div>

            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-blue-500 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>

          {prefsMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                prefsMsg.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}
            >
              {prefsMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{prefsMsg.text}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Theme Mode</label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700 rounded-xl max-w-md">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs font-bold text-white">Email Notifications</div>
                  <div className="text-[11px] text-slate-400">Receive alerts for status updates & deadlines</div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Display Density */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Display Density</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setDisplayMode('comfortable')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    displayMode === 'comfortable'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Comfortable
                </button>

                <button
                  type="button"
                  onClick={() => setDisplayMode('compact')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    displayMode === 'compact'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                Security Audit Log History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed record of account modifications, security changes, and profile events.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">Total Entries: {auditLogs.length}</span>
          </div>

          {isLoadingLogs ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No audit logs recorded for this account yet.</div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 font-mono text-[10px] font-bold rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-300 font-medium">
                      {log.details ? JSON.stringify(log.details) : 'Account action performed'}
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 flex items-center gap-3">
                    {log.ipAddress && <span className="font-mono text-slate-500">{log.ipAddress}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Admin User Directory & Role Management */}
      {activeTab === 'admin' && user?.role === 'ADMIN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-amber-400" />
                Enterprise User Role Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Administrator controls: view all registered user accounts and modify permissions.
              </p>
            </div>
          </div>

          {adminMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                adminMsg.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-800 text-rose-300'
              }`}
            >
              {adminMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{adminMsg.text}</span>
            </div>
          )}

          {isLoadingUsers ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading user list...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Identifiers</th>
                    <th className="py-3 px-3">Current Role</th>
                    <th className="py-3 px-3">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">@{u.username}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-300">{u.email}</div>
                        {u.studentId && <div className="text-[10px] text-emerald-400">Student ID: {u.studentId}</div>}
                        {u.employeeId && <div className="text-[10px] text-amber-400">Employee ID: {u.employeeId}</div>}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-800 text-blue-400 border border-slate-700 font-bold uppercase text-[10px] rounded">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {(['STUDENT', 'EMPLOYEE', 'ADMIN'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              onClick={() => handleUpdateRole(u.id, r)}
                              disabled={u.role === r}
                              className={`px-2 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                u.role === r
                                  ? 'bg-blue-600 text-white font-black'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
