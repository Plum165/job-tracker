import React, { useState } from 'react';
import { ActiveTab, useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Kanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    allOpportunities,
    privateStates,
    setIsAddOpportunityOpen,
    exportToExcel,
  } = useWorkspace();

  const { user, isAuthenticated, logout } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Quick stats counts
  let appliedCount = 0;
  let interviewCount = 0;
  let offerCount = 0;

  allOpportunities.forEach((opp) => {
    const st = privateStates[opp.id]?.status;
    if (st?.includes('Applied')) appliedCount++;
    if (st?.includes('Interview')) interviewCount++;
    if (st?.includes('Offer')) offerCount++;
  });

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'catalog', label: 'Opportunities', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'kanban', label: 'Kanban Board', icon: <Kanban className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar & Deadlines', icon: <Calendar className="w-4 h-4" /> },
    { id: 'contacts', label: 'Contacts Network', icon: <Users className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Imports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'auth', label: 'Auth & JWT Engine', icon: <ShieldCheck className="w-4 h-4 text-blue-400" /> },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        {/* Top Banner & Main Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Mobile Hamburger Toggle & Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Hamburger Button for Mobile Drawer */}
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 -ml-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg sm:hidden min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer border border-slate-700/60"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-500 rounded-lg shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Opportunity Hub
                </h1>
              </div>
            </div>

            {/* Desktop Quick Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search companies, positions, tags, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons & Counters */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Quick Status Pill Counters (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 font-medium rounded-lg">
                  Applied: <strong className="text-blue-400">{appliedCount}</strong>
                </span>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 font-medium rounded-lg">
                  Interviews: <strong className="text-amber-400">{interviewCount}</strong>
                </span>
                {offerCount > 0 && (
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 font-bold border border-emerald-600 animate-pulse rounded-lg">
                    Offers: {offerCount} 🎉
                  </span>
                )}
              </div>

              {/* Quick Export Button */}
              <button
                onClick={exportToExcel}
                title="Export Catalog & Application Status to Excel"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              {/* User Profile Badge & Logout Button */}
              {user && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left leading-tight">
                      <div className="font-bold text-white text-[11px] truncate max-w-[100px]">
                        {user.username}
                      </div>
                      <div className="text-[9px] text-blue-400 uppercase font-extrabold">
                        {user.role}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors border border-slate-800 hover:border-rose-900/50 flex items-center gap-1.5 text-xs font-semibold cursor-pointer rounded-lg min-h-[36px]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline text-[11px]">Sign Out</span>
                  </button>
                </div>
              )}

              {/* Add Opportunity Button */}
              <button
                onClick={() => setIsAddOpportunityOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer border border-blue-500 shadow-sm rounded-lg min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">+ New Job</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="py-2.5 md:hidden border-t border-slate-800/80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies, positions, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-semibold p-1 min-h-[32px]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Bar (Hidden on Mobile, replaced by Sidebar Drawer) */}
          <nav className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold transition-all shrink-0 cursor-pointer rounded-lg ${
                    isActive
                      ? 'bg-slate-800 text-white border-l-4 border-l-blue-500 border border-slate-700 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Retractable Mobile Sidebar Drawer Overlay & Panel */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Sidebar Drawer Panel */}
          <aside className="relative w-80 max-w-[85vw] bg-slate-900 text-white border-r border-slate-800 p-4 flex flex-col justify-between shadow-2xl z-10 h-full overflow-y-auto">
            <div>
              {/* Sidebar Header with Retract / Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded-lg border border-blue-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Menu</h2>
                    <p className="text-[10px] text-slate-400">Opportunity Hub Navigation</p>
                  </div>
                </div>

                {/* Retract / Close Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold cursor-pointer min-h-[44px]"
                  title="Retract Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Retract</span>
                </button>
              </div>

              {/* Navigation Items Vertical List */}
              <nav className="mt-4 space-y-1.5">
                <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                  Navigation
                </p>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer min-h-[48px] ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Metrics Section inside Mobile Sidebar */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                <p className="px-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Quick Pipeline Metrics
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                    <div className="text-[10px] text-slate-400">Applied</div>
                    <div className="text-base font-bold text-blue-400">{appliedCount}</div>
                  </div>
                  <div className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl">
                    <div className="text-[10px] text-slate-400">Interviews</div>
                    <div className="text-base font-bold text-amber-400">{interviewCount}</div>
                  </div>
                </div>
                {offerCount > 0 && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-emerald-300 font-medium">Offers Received</span>
                    <span className="font-bold text-emerald-400 text-sm">{offerCount} 🎉</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  setIsAddOpportunityOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border border-blue-500 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Opportunity</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  exportToExcel();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-700 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Export to Excel</span>
              </button>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 p-2 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer pt-2"
              >
                <X className="w-4 h-4" />
                <span>Retract Sidebar</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
