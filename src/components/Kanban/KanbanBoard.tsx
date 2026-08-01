import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDeadlineStatusBadge } from '../../lib/dateUtils';
import { ApplicationStatus, JobOpportunity } from '../../types';
import { ArrowRight, ChevronRight, ExternalLink, MoveRight, Star } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const {
    filteredOpportunities,
    getPrivateState,
    updateStatus,
    setSelectedOpportunity,
  } = useWorkspace();

  const columns: { status: ApplicationStatus; colorClass: string; badgeBg: string }[] = [
    { status: ApplicationStatus.RESEARCHING, colorClass: 'border-slate-300 dark:border-slate-700', badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    { status: ApplicationStatus.NOT_STARTED, colorClass: 'border-slate-300 dark:border-slate-700', badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' },
    { status: ApplicationStatus.PREPARING, colorClass: 'border-indigo-400 dark:border-indigo-800', badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' },
    { status: ApplicationStatus.APPLIED, colorClass: 'border-sky-400 dark:border-sky-800', badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' },
    { status: ApplicationStatus.INTERVIEW, colorClass: 'border-amber-400 dark:border-amber-800', badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
    { status: ApplicationStatus.OFFER, colorClass: 'border-emerald-500 dark:border-emerald-700', badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold animate-pulse' },
    { status: ApplicationStatus.REJECTED, colorClass: 'border-rose-300 dark:border-rose-800', badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' },
    { status: ApplicationStatus.CLOSED, colorClass: 'border-slate-300 dark:border-slate-800', badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
  ];

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Application Pipeline Kanban Board
          </h2>
          <p className="text-xs text-slate-500">
            Reassign stages directly using the quick status movement buttons or card selectors.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Columns Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x no-scrollbar">
        {columns.map((col) => {
          const colOpps = filteredOpportunities.filter((opp) => {
            const pState = getPrivateState(opp.id);
            return pState.status === col.status;
          });

          return (
            <div
              key={col.status}
              className={`w-72 shrink-0 flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border ${col.colorClass} p-3 space-y-3 min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {col.status}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                  {colOpps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                {colOpps.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No opportunities in this stage
                  </div>
                ) : (
                  colOpps.map((opp) => {
                    const pState = getPrivateState(opp.id);
                    const badge = getDeadlineStatusBadge(opp.closingDate);

                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        className="group p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
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
                          <span>{opp.jobCategory}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                        </div>

                        {pState.personalNotes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                            "{pState.personalNotes}"
                          </p>
                        )}

                        {/* Quick Status Shift Selector */}
                        <div
                          className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={pState.status}
                            onChange={(e) => updateStatus(opp.id, e.target.value as ApplicationStatus)}
                            className="text-[10px] font-semibold py-1 px-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            {columns.map((c) => (
                              <option key={c.status} value={c.status}>
                                Move to: {c.status}
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
