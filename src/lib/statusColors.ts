import { ApplicationStatus } from '../types';

export interface StatusColorStyle {
  status: ApplicationStatus;
  shortName: string;
  colorName: string;
  cardBorder: string;
  cardBg: string;
  accentBar: string;
  badgeBg: string;
  dotBg: string;
  tableRowBg: string;
  legendDesc: string;
}

export const STATUS_COLOR_MAP: Record<ApplicationStatus, StatusColorStyle> = {
  [ApplicationStatus.REJECTED]: {
    status: ApplicationStatus.REJECTED,
    shortName: 'Rejected',
    colorName: 'Red / Rose',
    cardBorder: 'border-rose-300 dark:border-rose-900 hover:border-rose-500',
    cardBg: 'bg-rose-50/40 dark:bg-rose-950/20',
    accentBar: 'bg-rose-600',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200 border border-rose-300 dark:border-rose-700 font-bold',
    dotBg: 'bg-rose-500',
    tableRowBg: 'hover:bg-rose-50/40 dark:hover:bg-rose-950/30',
    legendDesc: 'Application rejected / non-successful outcome',
  },
  [ApplicationStatus.CLOSED]: {
    status: ApplicationStatus.CLOSED,
    shortName: 'Closed / Missed',
    colorName: 'Slate Gray',
    cardBorder: 'border-slate-300 dark:border-slate-800 hover:border-slate-500',
    cardBg: 'bg-slate-100/40 dark:bg-slate-900/50',
    accentBar: 'bg-slate-500',
    badgeBg: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-medium',
    dotBg: 'bg-slate-400',
    tableRowBg: 'hover:bg-slate-100/40 dark:hover:bg-slate-800/40 opacity-75',
    legendDesc: 'Job listing expired before applying',
  },
  [ApplicationStatus.RESEARCHING]: {
    status: ApplicationStatus.RESEARCHING,
    shortName: 'Researching',
    colorName: 'Purple',
    cardBorder: 'border-purple-300 dark:border-purple-900 hover:border-purple-500',
    cardBg: 'bg-purple-50/30 dark:bg-purple-950/20',
    accentBar: 'bg-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border border-purple-300 dark:border-purple-700 font-semibold',
    dotBg: 'bg-purple-500',
    tableRowBg: 'hover:bg-purple-50/30 dark:hover:bg-purple-950/20',
    legendDesc: 'Gathering info / contacts / waiting for dates',
  },
  [ApplicationStatus.NOT_STARTED]: {
    status: ApplicationStatus.NOT_STARTED,
    shortName: 'Not Started',
    colorName: 'Zinc Neutral',
    cardBorder: 'border-zinc-200 dark:border-slate-800 hover:border-zinc-400',
    cardBg: 'bg-white dark:bg-slate-900',
    accentBar: 'bg-zinc-400',
    badgeBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium',
    dotBg: 'bg-zinc-400',
    tableRowBg: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
    legendDesc: 'Opportunity identified, application unstarted',
  },
  [ApplicationStatus.PREPARING]: {
    status: ApplicationStatus.PREPARING,
    shortName: 'Preparing',
    colorName: 'Amber / Orange',
    cardBorder: 'border-amber-300 dark:border-amber-800 hover:border-amber-500',
    cardBg: 'bg-amber-50/30 dark:bg-amber-950/20',
    accentBar: 'bg-amber-500',
    badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-semibold',
    dotBg: 'bg-amber-500',
    tableRowBg: 'hover:bg-amber-50/30 dark:hover:bg-amber-950/20',
    legendDesc: 'Refining CV, cover letter, or draft application',
  },
  [ApplicationStatus.APPLIED]: {
    status: ApplicationStatus.APPLIED,
    shortName: 'Applied (Waiting)',
    colorName: 'Blue / Sky',
    cardBorder: 'border-blue-300 dark:border-blue-800 hover:border-blue-500',
    cardBg: 'bg-blue-50/30 dark:bg-blue-950/20',
    accentBar: 'bg-blue-600',
    badgeBg: 'bg-blue-100 text-blue-900 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold',
    dotBg: 'bg-blue-500',
    tableRowBg: 'hover:bg-blue-50/30 dark:hover:bg-blue-950/20',
    legendDesc: 'Application submitted, pending company response',
  },
  [ApplicationStatus.INTERVIEW]: {
    status: ApplicationStatus.INTERVIEW,
    shortName: 'Interview Stage',
    colorName: 'Cyan / Indigo',
    cardBorder: 'border-indigo-400 dark:border-indigo-700 hover:border-indigo-500',
    cardBg: 'bg-indigo-50/40 dark:bg-indigo-950/30',
    accentBar: 'bg-indigo-600',
    badgeBg: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/80 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-600 font-bold',
    dotBg: 'bg-indigo-500',
    tableRowBg: 'hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30',
    legendDesc: 'Assessments, technical, or HR interviews in progress',
  },
  [ApplicationStatus.OFFER]: {
    status: ApplicationStatus.OFFER,
    shortName: 'Offer Received',
    colorName: 'Emerald Green',
    cardBorder: 'border-emerald-500 dark:border-emerald-600 hover:border-emerald-400',
    cardBg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
    accentBar: 'bg-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/90 dark:text-emerald-100 border border-emerald-400 dark:border-emerald-500 font-bold animate-pulse',
    dotBg: 'bg-emerald-500',
    tableRowBg: 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 bg-emerald-50/20 dark:bg-emerald-950/10',
    legendDesc: 'Formal job/internship offer received! 🎉',
  },
  [ApplicationStatus.WITHDRAWN]: {
    status: ApplicationStatus.WITHDRAWN,
    shortName: 'Withdrawn',
    colorName: 'Orange',
    cardBorder: 'border-orange-300 dark:border-orange-900 hover:border-orange-500',
    cardBg: 'bg-orange-50/30 dark:bg-orange-950/20',
    accentBar: 'bg-orange-500',
    badgeBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200 border border-orange-300 dark:border-orange-700 font-medium',
    dotBg: 'bg-orange-400',
    tableRowBg: 'hover:bg-orange-50/30 dark:hover:bg-orange-950/20',
    legendDesc: 'Decided not to apply or cancelled application',
  },
};

export function getStatusColorStyle(status?: ApplicationStatus): StatusColorStyle {
  if (!status || !STATUS_COLOR_MAP[status]) {
    return STATUS_COLOR_MAP[ApplicationStatus.NOT_STARTED];
  }
  return STATUS_COLOR_MAP[status];
}
