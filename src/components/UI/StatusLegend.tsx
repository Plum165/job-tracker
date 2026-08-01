import React, { useState } from 'react';
import { STATUS_COLOR_MAP } from '../../lib/statusColors';
import { ApplicationStatus } from '../../types';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface StatusLegendProps {
  activeStatusFilter?: ApplicationStatus | 'All';
  onSelectStatus?: (status: ApplicationStatus | 'All') => void;
  compact?: boolean;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({
  activeStatusFilter = 'All',
  onSelectStatus,
  compact = false,
}) => {
  // Default to closed on mobile screens (< 640px)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return false;
  });

  const statuses = Object.values(STATUS_COLOR_MAP);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
            Status Color Key
          </span>
          {activeStatusFilter !== 'All' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
              Filtered: {activeStatusFilter}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer shrink-0 py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-h-[36px]"
        >
          <span className="text-[11px] font-semibold">{isOpen ? 'Hide' : 'Show'} Key</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {statuses.map((item) => {
              const isSelected = activeStatusFilter === item.status;
              return (
                <button
                  key={item.status}
                  onClick={() => onSelectStatus && onSelectStatus(isSelected ? 'All' : item.status)}
                  className={`flex flex-col text-left p-2 rounded-lg border transition-all text-xs cursor-pointer ${
                    item.cardBg
                  } ${
                    isSelected
                      ? 'ring-2 ring-blue-500 border-blue-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                  }`}
                  title={`${item.status}: ${item.legendDesc}. Click to filter.`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotBg}`} />
                    <span className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate">
                      {item.shortName}
                    </span>
                  </div>
                  {!compact && (
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-tight">
                      {item.legendDesc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
