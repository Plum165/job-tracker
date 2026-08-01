import React from 'react';
import { ActiveTab, useWorkspace } from '../context/WorkspaceContext';
import {
  Briefcase,
  Calendar,
  Download,
  FileSpreadsheet,
  Kanban,
  LayoutDashboard,
  Plus,
  Search,
  Users,
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
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Banner & Main Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Opportunity Hub
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies, positions, tags, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
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
            {/* Quick Status Pill Counters */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                Applied: <strong className="text-blue-400">{appliedCount}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                Interviews: <strong className="text-amber-400">{interviewCount}</strong>
              </span>
              {offerCount > 0 && (
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 font-bold border border-emerald-600 animate-pulse">
                  Offers: {offerCount} 🎉
                </span>
              )}
            </div>

            {/* Quick Export Button */}
            <button
              onClick={exportToExcel}
              title="Export Catalog & Application Status to Excel"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700 hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {/* Add Opportunity Button */}
            <button
              onClick={() => setIsAddOpportunityOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer border border-blue-500 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">+ New Job</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="py-2 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, positions, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm sm:text-xs bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none rounded-lg"
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

        {/* Tab Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-slate-800 -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold transition-all shrink-0 cursor-pointer min-h-[44px] rounded-lg ${
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
  );
};
