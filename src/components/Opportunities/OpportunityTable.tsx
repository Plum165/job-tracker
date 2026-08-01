import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDeadlineStatusBadge } from '../../lib/dateUtils';
import { ApplicationStatus, JobOpportunity, PriorityLevel } from '../../types';
import { ExternalLink, Eye, Star } from 'lucide-react';

interface OpportunityTableProps {
  opportunities: JobOpportunity[];
}

export const OpportunityTable: React.FC<OpportunityTableProps> = ({ opportunities }) => {
  const {
    getPrivateState,
    updateStatus,
    updatePriority,
    setSelectedOpportunity,
  } = useWorkspace();

  const statusOptions = Object.values(ApplicationStatus);

  if (opportunities.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        No opportunities match your selected search or filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 w-12 text-center">Prio</th>
            <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">Shared Opportunity Info</th>
            <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">Deadline</th>
            <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">Category & Work</th>
            <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">Private Status (Local Storage)</th>
            <th className="py-3.5 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {opportunities.map((opp) => {
            const pState = getPrivateState(opp.id);
            const badge = getDeadlineStatusBadge(opp.closingDate);

            return (
              <tr
                key={opp.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                {/* Priority */}
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                  <button
                    onClick={() => {
                      const nextPrio: Record<PriorityLevel, PriorityLevel> = {
                        High: 'Low',
                        Medium: 'High',
                        Low: 'Medium',
                      };
                      updatePriority(opp.id, nextPrio[pState.priority]);
                    }}
                    title={`Priority: ${pState.priority}`}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        pState.priority === 'High'
                          ? 'fill-rose-500 text-rose-500'
                          : pState.priority === 'Medium'
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                </td>

                {/* Company & Role */}
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {opp.companyName}
                  </div>
                  <div className="text-sm text-slate-500">
                    {opp.jobTitle}
                  </div>
                </td>

                {/* Closing Date */}
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {opp.closingDate}
                  </div>
                  <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 mt-1 border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </td>

                {/* Category & Work */}
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {opp.jobCategory}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-0.5">
                    {opp.workArrangement} • {opp.employmentType}
                  </div>
                </td>

                {/* My Status */}
                <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <select
                      value={pState.status}
                      onChange={(e) => updateStatus(opp.id, e.target.value as ApplicationStatus)}
                      className="py-1 px-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  {pState.personalNotes && (
                    <p className="text-xs text-slate-500 italic mt-1 truncate">
                      "{pState.personalNotes}"
                    </p>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right space-x-2">
                  <a
                    href={opp.applicationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Open Application Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSelectedOpportunity(opp)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
