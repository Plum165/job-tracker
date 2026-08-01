/**
 * Date Utility Helpers for Application Tracking, Deadlines & Countdown Badges
 */

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getDaysUntilDeadline(closingDateStr: string): number {
  if (!closingDateStr) return 999;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = parseDate(closingDateStr);
  if (!deadline) return 999;
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export interface DeadlineBadgeInfo {
  label: string;
  badgeClass: string;
  isUrgent: boolean;
  isExpired: boolean;
  days: number;
}

export function getDeadlineStatusBadge(closingDateStr: string): DeadlineBadgeInfo {
  const days = getDaysUntilDeadline(closingDateStr);

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      label: absDays === 1 ? 'Closed yesterday' : `Closed ${absDays} days ago`,
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      isUrgent: false,
      isExpired: true,
      days,
    };
  }

  if (days === 0) {
    return {
      label: 'Closing today',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse font-semibold',
      isUrgent: true,
      isExpired: false,
      days,
    };
  }

  if (days === 1) {
    return {
      label: 'Closes tomorrow',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-semibold',
      isUrgent: true,
      isExpired: false,
      days,
    };
  }

  if (days <= 3) {
    return {
      label: `Closes in ${days} days`,
      badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      isUrgent: true,
      isExpired: false,
      days,
    };
  }

  if (days <= 7) {
    return {
      label: `Closes in ${days} days`,
      badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isUrgent: false,
      isExpired: false,
      days,
    };
  }

  return {
    label: `Closes in ${days} days`,
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    isUrgent: false,
    isExpired: false,
    days,
  };
}

export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isDateUpcoming(dateStr?: string, maxDays = 7): boolean {
  if (!dateStr) return false;
  const days = getDaysUntilDeadline(dateStr);
  return days >= 0 && days <= maxDays;
}

export function isDateToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return getDaysUntilDeadline(dateStr) === 0;
}
