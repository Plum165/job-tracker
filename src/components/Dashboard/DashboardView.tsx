import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getDaysUntilDeadline, getDeadlineStatusBadge, formatDateDisplay } from '../../lib/dateUtils';
import { ApplicationStatus } from '../../types';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    allOpportunities,
    privateStates,
    setSelectedOpportunity,
    setActiveTab,
    setIsAddOpportunityOpen,
    contacts,
  } = useWorkspace();

  // Metrics computation
  const totalOpps = allOpportunities.length;
  let researchingCount = 0;
  let notStartedCount = 0;
  let preparingCount = 0;
  let appliedCount = 0;
  let interviewCount = 0;
  let offerCount = 0;
  let rejectedCount = 0;
  let closedCount = 0;

  const urgentDeadlines: { opp: typeof allOpportunities[0]; days: number }[] = [];
  const upcomingInterviews: { opp: typeof allOpportunities[0]; dateStr: string; title: string }[] = [];

  allOpportunities.forEach((opp) => {
    const pState = privateStates[opp.id];
    const status = pState?.status || ApplicationStatus.NOT_STARTED;

    if (status === ApplicationStatus.RESEARCHING) researchingCount++;
    if (status === ApplicationStatus.NOT_STARTED) notStartedCount++;
    if (status === ApplicationStatus.PREPARING) preparingCount++;
    if (status === ApplicationStatus.APPLIED) appliedCount++;
    if (status === ApplicationStatus.INTERVIEW) interviewCount++;
    if (status === ApplicationStatus.OFFER) offerCount++;
    if (status === ApplicationStatus.REJECTED) rejectedCount++;
    if (status === ApplicationStatus.CLOSED) closedCount++;

    const daysLeft = getDaysUntilDeadline(opp.closingDate);
    if (daysLeft >= 0 && daysLeft <= 7) {
      urgentDeadlines.push({ opp, days: daysLeft });
    }

    if (pState?.interviewDates) {
      pState.interviewDates.forEach((inv) => {
        upcomingInterviews.push({
          opp,
          dateStr: inv.date,
          title: inv.title || 'Scheduled Interview',
        });
      });
    }
  });

  // Sort urgent deadlines by days remaining
  urgentDeadlines.sort((a, b) => a.days - b.days);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-blue-400 text-xs font-bold uppercase tracking-widest border border-slate-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shared Catalog • Private Local Storage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Application Dashboard
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Engineering Team / Shared Repository 01
          </p>
          <p className="text-sm text-slate-300 leading-relaxed pt-1">
            Track job applications, graduate programmes, and internships with zero online servers.
            Your notes, application dates, and recruiter contacts remain <strong>100% local and private</strong> on your device.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-blue-500"
            >
              <span>Explore Opportunities ({totalOpps})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAddOpportunityOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>+ New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid: Geometric Consistency */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Active</span>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalOpps}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Catalog Entries</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2 border-l-4 border-l-blue-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Waiting</span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{appliedCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Awaiting Feedback</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Interviews</span>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{interviewCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Active Stages</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Offers</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{offerCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Accepted / Received</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2 border-l-4 border-l-rose-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rejections</span>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{rejectedCount}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Archived</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-2 border-l-4 border-l-teal-500">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contacts</span>
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{contacts.length}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Saved Recruiters</div>
        </div>
      </div>

      {/* Main Content Split: Upcoming Deadlines & Status Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent Deadlines Alert Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Closing Deadlines (Next 7 Days)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentDeadlines.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No immediate closing deadlines in the next 7 days!
              </p>
              <p className="text-xs text-slate-500">
                All saved opportunities are either open long-term or already closed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {urgentDeadlines.map(({ opp, days }) => {
                const badge = getDeadlineStatusBadge(opp.closingDate);
                const pState = privateStates[opp.id];
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpportunity(opp)}
                    className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {opp.companyName}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {opp.jobTitle}
                          </h4>
                        </div>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium shrink-0 ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{opp.jobCategory}</span>
                        <span>•</span>
                        <span>{opp.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        My Status: <strong className="text-slate-900 dark:text-slate-200">{pState?.status || ApplicationStatus.NOT_STARTED}</strong>
                      </span>
                      <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Featured Company Catalog Showcase */}
          <div className="pt-4 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Featured Opportunities Catalog
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allOpportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpportunity(opp)}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {opp.companyName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {opp.employmentType}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {opp.jobTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {opp.companyDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Funnel & Status Summary Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <span>Application Pipeline</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { status: ApplicationStatus.RESEARCHING, count: researchingCount, color: 'bg-slate-500' },
                { status: ApplicationStatus.NOT_STARTED, count: notStartedCount, color: 'bg-slate-400' },
                { status: ApplicationStatus.PREPARING, count: preparingCount, color: 'bg-indigo-500' },
                { status: ApplicationStatus.APPLIED, count: appliedCount, color: 'bg-sky-500' },
                { status: ApplicationStatus.INTERVIEW, count: interviewCount, color: 'bg-amber-500' },
                { status: ApplicationStatus.OFFER, count: offerCount, color: 'bg-emerald-500' },
                { status: ApplicationStatus.REJECTED, count: rejectedCount, color: 'bg-rose-500' },
                { status: ApplicationStatus.CLOSED, count: closedCount, color: 'bg-slate-600' },
              ].map((item) => {
                const percentage = totalOpps > 0 ? Math.round((item.count / totalOpps) * 100) : 0;
                return (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                      <span className="text-slate-500">
                        <strong>{item.count}</strong> ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Privacy Notice Card */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>How Privacy & Shared Data Work</span>
            </div>
            <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              When your friends open this app, they see the same shared list of company opportunities.
              However, their private application status, interview notes, and saved contacts stay securely inside their own browser.
            </p>
            <button
              onClick={() => setActiveTab('data')}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline"
            >
              Export or backup your data anytime →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
