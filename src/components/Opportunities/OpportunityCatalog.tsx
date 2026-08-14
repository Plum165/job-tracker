import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ApplicationStatus, JobCategory, PriorityLevel, WorkArrangement } from '../../types';
import { StatusLegend } from '../UI/StatusLegend';
import { OpportunityCard } from './OpportunityCard';
import { OpportunityTable } from './OpportunityTable';
import {
  Briefcase,
  Filter,
  Globe,
  Grid,
  List,
  Lock,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

export const OpportunityCatalog: React.FC = () => {
  const {
    allOpportunities,
    publicOpportunities,
    privateOpportunities,
    filteredOpportunities,
    catalogViewMode,
    setCatalogViewMode,
    catalogScope,
    setCatalogScope,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedWorkArrangement,
    setSelectedWorkArrangement,
    selectedLocation,
    setSelectedLocation,
    selectedPriority,
    setSelectedPriority,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    resetFilters,
  } = useWorkspace();

  const categories: (JobCategory | 'All')[] = [
    'All',
    'Software Engineering',
    'Data Science',
    'Graduate Programme',
    'Internship',
    'Product & Design',
    'Finance & Fintech',
    'Cybersecurity',
    'Other',
  ];

  const statuses: (ApplicationStatus | 'All')[] = ['All', ...Object.values(ApplicationStatus)];

  const arrangements: (WorkArrangement | 'All')[] = ['All', 'Remote', 'Hybrid', 'On-site'];

  const priorities: (PriorityLevel | 'All')[] = ['All', 'High', 'Medium', 'Low'];

  const availableLocations = [
    'All',
    ...Array.from(new Set(allOpportunities.map((o) => o.location).filter(Boolean))),
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    selectedWorkArrangement !== 'All' ||
    selectedLocation !== 'All' ||
    selectedPriority !== 'All' ||
    selectedTag !== null;

  return (
    <div className="space-y-6 pb-12">
      {/* 2-Section Catalog Scope Switcher */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Catalogue View
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Public jobs show active deadlines only; private jobs are yours and can include expired opportunities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setCatalogScope('all')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              catalogScope === 'all'
                ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>All Opportunities ({allOpportunities.length})</span>
          </button>

          <button
            onClick={() => setCatalogScope('public')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              catalogScope === 'public'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Public Catalogue ({publicOpportunities.length})</span>
          </button>

          <button
            onClick={() => setCatalogScope('private')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              catalogScope === 'private'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Private Catalogue ({privateOpportunities.length})</span>
          </button>
        </div>
      </div>

      {/* Status Legend Key & Filter */}
      <StatusLegend
        activeStatusFilter={selectedStatus}
        onSelectStatus={(st) => setSelectedStatus(st)}
      />

      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white border-b-2 border-b-blue-500 font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Filter & Control Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Filter Select Controls */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 flex-1 w-full sm:w-auto">
            
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[40px]">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus | 'All')}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {statuses.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Arrangement */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[40px]">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Work:</span>
              <select
                value={selectedWorkArrangement}
                onChange={(e) => setSelectedWorkArrangement(e.target.value as WorkArrangement | 'All')}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {arrangements.map((wa) => (
                  <option key={wa} value={wa} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {wa}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[40px]">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Location:</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[40px]">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel | 'All')}
                className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer truncate"
              >
                {priorities.map((p) => (
                  <option key={p} value={p} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1 min-h-[40px]">
              <span className="text-[11px] font-medium text-slate-500 shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'closingDate' | 'dateAdded' | 'company' | 'priority')}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="closingDate" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  Closing Date (Soonest)
                </option>
                <option value="dateAdded" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  Date Added (Newest)
                </option>
                <option value="company" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  Company Name (A-Z)
                </option>
                <option value="priority" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  Priority (Highest)
                </option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Card vs Table View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCatalogViewMode('card')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                catalogViewMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCatalogViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                catalogViewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table Matrix View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border">
                Search: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                Cat: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-medium border border-sky-200 dark:border-sky-800">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('All')} />
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-800">
                #{selectedTag}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTag(null)} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Counter & Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong>{filteredOpportunities.length}</strong> of {filteredOpportunities.length} opportunities
        </span>
      </div>

      {/* Main View Renderer */}
      {catalogViewMode === 'card' ? (
        filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <Filter className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No job opportunities match your filters.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )
      ) : (
        <OpportunityTable opportunities={filteredOpportunities} />
      )}
    </div>
  );
};
