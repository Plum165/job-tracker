import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDeadlineStatusBadge } from '../../lib/dateUtils';
import { ApplicationStatus, JobOpportunity, PriorityLevel } from '../../types';
import {
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  Star,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: JobOpportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const {
    getPrivateState,
    updateStatus,
    updatePriority,
    setSelectedOpportunity,
  } = useWorkspace();

  const pState = getPrivateState(opportunity.id);
  const badge = getDeadlineStatusBadge(opportunity.closingDate);

  const statusOptions = Object.values(ApplicationStatus);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Top Banner Accent */}
      <div className="h-1 w-full bg-blue-600" />

      <div className="p-5 space-y-4">
        {/* Header Row: Company & Priority Star */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 text-sm shrink-0">
              {opportunity.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {opportunity.companyName}
                </span>
                {!opportunity.isShared && (
                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.2 bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300 border border-blue-200 dark:border-slate-700">
                    Local
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {opportunity.jobTitle}
              </h3>
            </div>
          </div>

          {/* Priority Flag Selector */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextPrio: Record<PriorityLevel, PriorityLevel> = {
                High: 'Low',
                Medium: 'High',
                Low: 'Medium',
              };
              updatePriority(opportunity.id, nextPrio[pState.priority]);
            }}
            title={`Priority: ${pState.priority}. Click to cycle.`}
            className={`p-1.5 border transition-colors cursor-pointer ${
              pState.priority === 'High'
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : pState.priority === 'Medium'
                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${pState.priority === 'High' ? 'fill-rose-500' : pState.priority === 'Medium' ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {opportunity.jobCategory}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {opportunity.workArrangement}
          </span>
          <span className="text-[10px] font-medium uppercase px-2 py-0.5 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {opportunity.employmentType}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {opportunity.companyDescription}
        </p>

        {/* Location & Closing Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{opportunity.location}</span>
          </div>

          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${badge.badgeClass}`}>
            {badge.label}
          </span>
        </div>

        {/* Tags Row */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {opportunity.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Private Status Bar Footer */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-500 uppercase tracking-widest">
            Local Application Status
          </span>
          {pState.personalNotes && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              <FileText className="w-3 h-3" /> Note saved
            </span>
          )}
        </div>

        {/* Quick Inline Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={pState.status}
            onChange={(e) => updateStatus(opportunity.id, e.target.value as ApplicationStatus)}
            className="flex-1 py-1.5 px-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSelectedOpportunity(opportunity)}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 cursor-pointer border border-blue-500"
          >
            Notes & Details
          </button>
        </div>
      </div>
    </div>
  );
};
