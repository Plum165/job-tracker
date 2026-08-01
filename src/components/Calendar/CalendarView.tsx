import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateDisplay, getDaysUntilDeadline, getDeadlineStatusBadge } from '../../lib/dateUtils';
import { ApplicationStatus, JobOpportunity } from '../../types';
import { AlertTriangle, Calendar as CalendarIcon, Clock, ExternalLink, Flag } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { allOpportunities, privateStates, setSelectedOpportunity } = useWorkspace();

  // Aggregate timeline events: closing dates, interview dates, follow-up dates
  interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    type: 'closing' | 'interview' | 'followup';
    title: string;
    company: string;
    opp: JobOpportunity;
    badgeLabel?: string;
    isUrgent?: boolean;
  }

  const events: CalendarEvent[] = [];

  allOpportunities.forEach((opp) => {
    const pState = privateStates[opp.id];

    // Closing date event
    if (opp.closingDate) {
      const days = getDaysUntilDeadline(opp.closingDate);
      events.push({
        id: `close-${opp.id}`,
        date: opp.closingDate,
        type: 'closing',
        title: `Application Deadline: ${opp.jobTitle}`,
        company: opp.companyName,
        opp,
        isUrgent: days >= 0 && days <= 3,
      });
    }

    // Interview dates
    if (pState?.interviewDates) {
      pState.interviewDates.forEach((inv) => {
        if (inv.date) {
          events.push({
            id: `inv-${inv.id}`,
            date: inv.date,
            type: 'interview',
            title: `Interview: ${inv.title || opp.jobTitle}`,
            company: opp.companyName,
            opp,
            isUrgent: true,
          });
        }
      });
    }

    // Follow-up date
    if (pState?.followUpDate) {
      events.push({
        id: `followup-${opp.id}`,
        date: pState.followUpDate,
        type: 'followup',
        title: `Follow-up Reminder for ${opp.companyName}`,
        company: opp.companyName,
        opp,
      });
    }
  });

  // Sort timeline chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <span>Deadlines & Milestones Schedule</span>
          </h2>
          <p className="text-xs text-slate-500">
            Chronological timeline of application closing dates, interview dates, and personal follow-up reminders.
          </p>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic text-xs">
            No upcoming deadlines or scheduled interviews.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => {
              const daysLeft = getDaysUntilDeadline(evt.date);
              const badge = getDeadlineStatusBadge(evt.date);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedOpportunity(evt.opp)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Event Type Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        evt.type === 'closing'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : evt.type === 'interview'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      }`}
                    >
                      {evt.type === 'closing' && <AlertTriangle className="w-5 h-5" />}
                      {evt.type === 'interview' && <Clock className="w-5 h-5" />}
                      {evt.type === 'followup' && <Flag className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {evt.company}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {evt.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {evt.title}
                      </h4>
                    </div>
                  </div>

                  {/* Date & Urgency Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatDateDisplay(evt.date)}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
