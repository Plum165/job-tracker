import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateDisplay, getDeadlineStatusBadge, getDaysUntilDeadline } from '../../lib/dateUtils';
import { getStatusColorStyle } from '../../lib/statusColors';
import { ApplicationStatus, JobCategory, JobOpportunity } from '../../types';
import { StatusLegend } from '../UI/StatusLegend';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  Flag,
  List,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

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

export const CalendarView: React.FC = () => {
  const {
    allOpportunities,
    filteredOpportunities,
    privateStates,
    setSelectedOpportunity,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedLocation,
    setSelectedLocation,
    resetFilters,
  } = useWorkspace();

  // Mode: 'traditional' (Month Grid) or 'timeline' (Chronological List)
  const [calendarMode, setCalendarMode] = useState<'traditional' | 'timeline'>('traditional');
  
  // Toggle to show/hide past events in timeline (default false = hide past events unless asked)
  const [showPastEvents, setShowPastEvents] = useState<boolean>(false);

  // Month navigation state for traditional calendar view
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  // Dynamic list of unique locations
  const availableLocations = [
    'All',
    ...Array.from(new Set(allOpportunities.map((o) => o.location).filter(Boolean))),
  ];

  // Aggregate events from filteredOpportunities (ensures Search & Filter works in Calendar!)
  const events: CalendarEvent[] = [];

  filteredOpportunities.forEach((opp) => {
    const pState = privateStates[opp.id];

    // Closing date event
    if (opp.closingDate) {
      const days = getDaysUntilDeadline(opp.closingDate);
      events.push({
        id: `close-${opp.id}`,
        date: opp.closingDate,
        type: 'closing',
        title: `Deadline: ${opp.jobTitle}`,
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
        title: `Follow-up: ${opp.companyName}`,
        company: opp.companyName,
        opp,
      });
    }
  });

  // Sort timeline chronologically
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build Grid Cells for Traditional Month View
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarGrid: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Previous month padding cells
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = currentMonth === 0 ? 11 : currentMonth - 1;
    const py = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGrid.push({ dateStr, dayNumber: d, isCurrentMonth: false, isToday: false });
  }

  // Current month cells
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGrid.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month padding cells to complete 35 or 42 grid total
  const remainingCells = (7 - (calendarGrid.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nm = currentMonth === 11 ? 0 : currentMonth + 1;
    const ny = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarGrid.push({ dateStr, dayNumber: d, isCurrentMonth: false, isToday: false });
  }

  // Quick lookup map for events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((evt) => {
    // Normalise date string YYYY-MM-DD
    const dStr = evt.date.split('T')[0];
    if (!eventsByDate[dStr]) {
      eventsByDate[dStr] = [];
    }
    eventsByDate[dStr].push(evt);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <span>Deadlines & Milestones Calendar</span>
          </h2>
          <p className="text-xs text-slate-500">
            View job deadlines, interview dates, and reminders in a traditional calendar grid or chronological list.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCalendarMode('traditional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                calendarMode === 'traditional'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              onClick={() => setCalendarMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                calendarMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Timeline List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar (Fulfills request: searches can be done under calendar) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search calendar events, companies, locations, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
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

          {/* Reset Filters button if any active */}
          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedLocation !== 'All') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Search</span>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-xs font-medium text-slate-400 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-[11px] font-semibold whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Location Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-xs font-medium text-slate-400 shrink-0">Location:</span>
          {availableLocations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1 text-[11px] font-semibold whitespace-nowrap rounded-lg transition-all cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📍 {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Status Legend Key & Filter */}
      <StatusLegend
        activeStatusFilter={selectedStatus}
        onSelectStatus={(st) => setSelectedStatus(st)}
        compact
      />

      {/* Main Calendar View Rendering */}
      {calendarMode === 'traditional' ? (
        /* TRADITIONAL MONTH GRID VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
          
          {/* Month Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100 dark:border-slate-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              const cellEvents = eventsByDate[cell.dateStr] || [];

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    cell.isToday
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                      : cell.isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      : 'bg-slate-100/30 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/50 opacity-40'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        cell.isToday
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cellEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Container */}
                  <div className="space-y-1 overflow-y-auto max-h-[75px] pt-1 no-scrollbar">
                    {cellEvents.map((evt) => {
                      const pState = privateStates[evt.opp.id];
                      const statusStyle = getStatusColorStyle(pState?.status);

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedOpportunity(evt.opp)}
                          className={`p-1 rounded text-[10px] font-semibold border cursor-pointer truncate transition-all ${
                            evt.type === 'closing'
                              ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800'
                              : evt.type === 'interview'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
                              : 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800'
                          }`}
                          title={`${evt.company}: ${evt.title} (${evt.date})`}
                        >
                          <span className="font-extrabold mr-1">
                            {evt.type === 'closing' ? '⏳' : evt.type === 'interview' ? '📞' : '📌'}
                          </span>
                          <span className="truncate">{evt.company}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CHRONOLOGICAL TIMELINE LIST VIEW */
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          {/* Timeline Header & Past Events Toggle */}
          {(() => {
            const todayMs = new Date().setHours(0, 0, 0, 0);
            const pastEventsCount = events.filter((e) => new Date(e.date).getTime() < todayMs).length;
            const timelineEvents = showPastEvents
              ? events
              : events.filter((e) => new Date(e.date).getTime() >= todayMs);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="text-xs font-semibold text-slate-500">
                    Showing <strong className="text-slate-900 dark:text-slate-100">{timelineEvents.length}</strong> {showPastEvents ? 'total' : 'upcoming'} milestone events
                  </div>
                  {pastEventsCount > 0 && (
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={showPastEvents}
                        onChange={(e) => setShowPastEvents(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Show Passed Events ({pastEventsCount})</span>
                    </label>
                  )}
                </div>

                {timelineEvents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic text-xs space-y-2">
                    <p>No upcoming deadlines or events matching your criteria.</p>
                    {pastEventsCount > 0 && !showPastEvents && (
                      <button
                        onClick={() => setShowPastEvents(true)}
                        className="text-xs text-emerald-600 font-bold hover:underline"
                      >
                        Show {pastEventsCount} passed events
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timelineEvents.map((evt) => {
                      const daysLeft = getDaysUntilDeadline(evt.date);
                      const badge = getDeadlineStatusBadge(evt.date);
                      const pState = privateStates[evt.opp.id];
                      const statusStyle = getStatusColorStyle(pState?.status);
                      const isPast = new Date(evt.date).getTime() < todayMs;

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedOpportunity(evt.opp)}
                          className={`p-4 rounded-xl border ${statusStyle.cardBorder} hover:border-emerald-500 ${
                            isPast ? 'opacity-60 bg-slate-50/70 dark:bg-slate-950/40' : statusStyle.cardBg
                          } transition-all cursor-pointer flex items-center justify-between gap-4`}
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
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded ${statusStyle.badgeBg}`}>
                                  {pState?.status || evt.type}
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
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
