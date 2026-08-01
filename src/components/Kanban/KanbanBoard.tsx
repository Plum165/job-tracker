import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateDisplay, getDeadlineStatusBadge } from '../../lib/dateUtils';
import { getStatusColorStyle } from '../../lib/statusColors';
import { ApplicationStatus, JobCategory } from '../../types';
import { StatusLegend } from '../UI/StatusLegend';
import {
  Calendar,
  Clock,
  Filter,
  Kanban,
  RotateCcw,
  Search,
  Star,
  X,
} from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const {
    filteredOpportunities,
    getPrivateState,
    updateStatus,
    setSelectedOpportunity,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    resetFilters,
  } = useWorkspace();

  const allStatuses = Object.values(ApplicationStatus);

  const categories: (JobCategory | 'All')[] = [
    'All',
    'Software Engineering',
    'Data Science',
    'Graduate Programme',
    'Internship',
    'Vacation Work',
    'Product & Design',
    'Finance & Fintech',
    'Cybersecurity',
    'Other',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-600" />
            <span>Application Pipeline Kanban Board</span>
          </h2>
          <p className="text-xs text-slate-500">
            Drag, search, or update status stages directly across all opportunities.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Kanban board by company, position, tag, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={resetFilters}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-1 shrink-0 cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Legend Key & Filter */}
      <StatusLegend
        activeStatusFilter={selectedStatus}
        onSelectStatus={(st) => setSelectedStatus(st)}
      />

      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all rounded-lg cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x no-scrollbar">
        {allStatuses.map((st) => {
          const statusStyle = getStatusColorStyle(st);
          const colOpps = filteredOpportunities.filter((opp) => {
            const pState = getPrivateState(opp.id);
            return pState.status === st;
          });

          // If a status filter is active, dim unselected columns
          const isDimmed = selectedStatus !== 'All' && selectedStatus !== st;

          return (
            <div
              key={st}
              className={`w-80 shrink-0 flex flex-col rounded-2xl ${
                statusStyle.cardBg
              } border ${statusStyle.cardBorder} p-3 space-y-3 min-h-[520px] transition-all ${
                isDimmed ? 'opacity-40 grayscale-[30%]' : 'opacity-100'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${statusStyle.dotBg}`} />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {st}
                  </h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusStyle.badgeBg}`}>
                  {colOpps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[72vh] pr-1">
                {colOpps.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No matching applications
                  </div>
                ) : (
                  colOpps.map((opp) => {
                    const pState = getPrivateState(opp.id);
                    const badge = getDeadlineStatusBadge(opp.closingDate);
                    const cardStyle = getStatusColorStyle(pState.status);

                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        className={`group p-3.5 rounded-xl bg-white dark:bg-slate-900 border ${cardStyle.cardBorder} hover:shadow-md transition-all cursor-pointer space-y-2.5 relative overflow-hidden`}
                      >
                        {/* Top Accent Line */}
                        <div className={`h-1 -mx-3.5 -mt-3.5 mb-2 ${cardStyle.accentBar}`} />

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {opp.companyName}
                            </span>
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                              {opp.jobTitle}
                            </h4>
                          </div>
                          {pState.priority === 'High' && (
                            <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-[10px]">
                            {opp.jobCategory}
                          </span>
                          <span className="text-[10px] text-slate-400">{opp.workArrangement}</span>
                        </div>

                        {/* Explicit Date Info Block (Closing date + Date applied) */}
                        <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3 h-3 text-rose-500" />
                              {formatDateDisplay(opp.closingDate)}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${badge.badgeClass}`}>
                              {badge.label}
                            </span>
                          </div>

                          {pState.dateApplied && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium pt-0.5 border-t border-slate-200/50 dark:border-slate-700/50">
                              <Clock className="w-3 h-3" /> Applied: {formatDateDisplay(pState.dateApplied)}
                            </div>
                          )}
                        </div>

                        {pState.personalNotes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-amber-50/50 dark:bg-slate-800/40 p-1.5 rounded border border-amber-100 dark:border-slate-800">
                            "{pState.personalNotes}"
                          </p>
                        )}

                        {/* Quick Status Shift Selector */}
                        <div
                          className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={pState.status}
                            onChange={(e) => updateStatus(opp.id, e.target.value as ApplicationStatus)}
                            className={`w-full text-[10px] font-semibold py-1 px-1.5 ${cardStyle.badgeBg} rounded focus:outline-none cursor-pointer`}
                          >
                            {allStatuses.map((c) => (
                              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-normal">
                                Move to: {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
