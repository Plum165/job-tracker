import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateDisplay, getDeadlineStatusBadge } from '../../lib/dateUtils';
import {
  ApplicationStatus,
  Contact,
  InterviewRecord,
  PersonalLink,
  PriorityLevel,
  UserApplicationState,
} from '../../types';
import {
  Calendar,
  CheckSquare,
  Copy,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Link,
  MapPin,
  Plus,
  Save,
  Star,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';

export const OpportunityDetailModal: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedOpportunity,
    setSelectedOpportunity,
    getPrivateState,
    savePrivateState,
    updateStatus,
    updatePriority,
    contacts,
    saveContact,
    startEditingOpportunity,
    copyOpportunityToPrivate,
    privateOpportunities,
  } = useWorkspace();

  if (!selectedOpportunity) return null;

  const pState = getPrivateState(selectedOpportunity.id);
  const badge = getDeadlineStatusBadge(selectedOpportunity.closingDate);
  const isPublicJob = selectedOpportunity.isShared;
  const isCopiedToPrivate = privateOpportunities.some(
    (opp) =>
      opp.companyName === selectedOpportunity.companyName &&
      opp.jobTitle === selectedOpportunity.jobTitle &&
      opp.applicationLink === selectedOpportunity.applicationLink
  );
  const canEditJob = !isPublicJob || user?.role === 'ADMIN';

  // Local form state for modal editing
  const [activeTab, setActiveTab] = useState<'notes' | 'checklist' | 'interviews' | 'links' | 'contacts'>('notes');
  const [personalNotes, setPersonalNotes] = useState(pState.personalNotes || '');
  const [dateApplied, setDateApplied] = useState(pState.dateApplied || '');
  const [followUpDate, setFollowUpDate] = useState(pState.followUpDate || '');
  const [documentsPrepared, setDocumentsPrepared] = useState(pState.documentsPrepared);

  // Interview sub-form state
  const [interviews, setInterviews] = useState<InterviewRecord[]>(pState.interviewDates || []);
  const [newInterviewTitle, setNewInterviewTitle] = useState('');
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newInterviewNotes, setNewInterviewNotes] = useState('');

  // Personal links state
  const [personalLinks, setPersonalLinks] = useState<PersonalLink[]>(pState.personalLinks || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Save changes handler
  const handleSaveModal = () => {
    const updatedState: UserApplicationState = {
      ...pState,
      personalNotes,
      dateApplied,
      followUpDate,
      documentsPrepared,
      interviewDates: interviews,
      personalLinks,
    };
    savePrivateState(updatedState);
    setSelectedOpportunity(null);
  };

  // Interview handlers
  const handleAddInterview = () => {
    if (!newInterviewDate) return;
    const record: InterviewRecord = {
      id: `inv-${Date.now()}`,
      title: newInterviewTitle || 'Interview Stage',
      date: newInterviewDate,
      notes: newInterviewNotes,
      completed: false,
    };
    setInterviews([...interviews, record]);
    setNewInterviewTitle('');
    setNewInterviewDate('');
    setNewInterviewNotes('');
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(interviews.filter((i) => i.id !== id));
  };

  // Link handlers
  const handleAddLink = () => {
    if (!newLinkUrl) return;
    const linkItem: PersonalLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle || 'Personal Link',
      url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`,
    };
    setPersonalLinks([...personalLinks, linkItem]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleDeleteLink = (id: string) => {
    setPersonalLinks(personalLinks.filter((l) => l.id !== id));
  };

  // Contacts linked to this company
  const companyContacts = contacts.filter(
    (c) =>
      c.opportunityId === selectedOpportunity.id ||
      c.company.toLowerCase() === selectedOpportunity.companyName.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-3 sm:my-8 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {selectedOpportunity.companyName}
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                {badge.label}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isPublicJob
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}>
                {isPublicJob ? 'Public Catalogue' : 'Private Catalogue'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {selectedOpportunity.jobTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
              <span>{selectedOpportunity.jobCategory}</span>
              <span>•</span>
              <span>{selectedOpportunity.location}</span>
              <span>•</span>
              <span>{selectedOpportunity.workArrangement}</span>
            </div>
          </div>

          <button
            onClick={() => setSelectedOpportunity(null)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Action Link & Status Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                My Status
              </label>
              <select
                value={pState.status}
                onChange={(e) => updateStatus(selectedOpportunity.id, e.target.value as ApplicationStatus)}
                className="w-full py-1.5 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                {Object.values(ApplicationStatus).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                My Priority
              </label>
              <select
                value={pState.priority}
                onChange={(e) => updatePriority(selectedOpportunity.id, e.target.value as PriorityLevel)}
                className="w-full py-1.5 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Application Link Button */}
            <div className="flex flex-col justify-end">
              <a
                href={selectedOpportunity.applicationLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 text-xs font-bold text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Apply / Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canEditJob && (
              <button
                type="button"
                onClick={() => startEditingOpportunity(selectedOpportunity)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Job</span>
              </button>
            )}

            {isPublicJob && (
              <button
                type="button"
                disabled={isCopiedToPrivate}
                onClick={() => copyOpportunityToPrivate(selectedOpportunity)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 text-white rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopiedToPrivate ? 'Saved to Private' : 'Copy to Private'}</span>
              </button>
            )}
          </div>

          {/* Shared Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Company Overview & Shared Notes
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {selectedOpportunity.companyDescription}
            </p>
            {selectedOpportunity.generalNotes && (
              <p className="text-xs text-slate-500 italic">
                Note: {selectedOpportunity.generalNotes}
              </p>
            )}
          </div>

          {/* Sub-Tabs for Private Data Editing */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'notes', label: 'Private Notes & Dates', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'checklist', label: 'Document Checklist', icon: <CheckSquare className="w-3.5 h-3.5" /> },
              { id: 'interviews', label: `Interviews (${interviews.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
              { id: 'links', label: `My Links (${personalLinks.length})`, icon: <Link className="w-3.5 h-3.5" /> },
              { id: 'contacts', label: `Recruiter Contacts (${companyContacts.length})`, icon: <UserCheck className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Private Notes & Dates */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date Applied
                  </label>
                  <input
                    type="date"
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                    className="w-full p-2.5 sm:p-2 text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 sm:p-2 text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Personal Research & Application Strategy Notes (Private)
                </label>
                <textarea
                  rows={5}
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="E.g., Researched digital transformation work. Contacted recruiter on LinkedIn. Need to tailor Java & React projects..."
                  className="w-full p-3 text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Document Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Application Requirements Checklist
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'cvReady', label: 'Tailored CV / Resume Ready' },
                  { key: 'coverLetterReady', label: 'Personalized Cover Letter Ready' },
                  { key: 'portfolioIncluded', label: 'Portfolio / GitHub Projects Included' },
                  { key: 'transcriptIncluded', label: 'Academic Transcript Attached' },
                  { key: 'assessmentComplete', label: 'Coding Assessment / Test Complete' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(documentsPrepared[item.key as keyof typeof documentsPrepared])}
                      onChange={(e) =>
                        setDocumentsPrepared({
                          ...documentsPrepared,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Interviews & Milestones */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              {/* Add New Interview Form */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Log New Interview / Technical Assessment
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (e.g. 1st Technical Interview)"
                    value={newInterviewTitle}
                    onChange={(e) => setNewInterviewTitle(e.target.value)}
                    className="p-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="date"
                    value={newInterviewDate}
                    onChange={(e) => setNewInterviewDate(e.target.value)}
                    className="p-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notes (e.g. Prep system design & LeetCode medium)"
                  value={newInterviewNotes}
                  onChange={(e) => setNewInterviewNotes(e.target.value)}
                  className="w-full p-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                />
                <button
                  onClick={handleAddInterview}
                  disabled={!newInterviewDate}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg disabled:opacity-50"
                >
                  + Add Interview Date
                </button>
              </div>

              {/* List of interviews */}
              {interviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  No interview dates logged yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {interviews.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{inv.title}</div>
                        <div className="text-emerald-600 font-semibold">{formatDateDisplay(inv.date)}</div>
                        {inv.notes && <div className="text-slate-500">{inv.notes}</div>}
                      </div>
                      <button
                        onClick={() => handleDeleteInterview(inv.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Personal Links */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attach Personal Application Links (Tailored CV doc, Google Drive, Portfolio)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Link Title (e.g. My Tailored Resume PDF)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="p-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. https://drive.google.com/...)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="p-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                  />
                </div>
                <button
                  onClick={handleAddLink}
                  disabled={!newLinkUrl}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg disabled:opacity-50"
                >
                  + Add Link
                </button>
              </div>

              {personalLinks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No personal links added.</p>
              ) : (
                <div className="space-y-2">
                  {personalLinks.map((lnk) => (
                    <div
                      key={lnk.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border flex items-center justify-between text-xs"
                    >
                      <a
                        href={lnk.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-600 hover:underline flex items-center gap-1.5"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>{lnk.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink(lnk.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Linked Recruiter Contacts */}
          {activeTab === 'contacts' && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Contacts at {selectedOpportunity.companyName}
              </h5>
              {companyContacts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">
                  No recruiter or networking contacts linked to this company yet. Add them under the Contacts tab!
                </p>
              ) : (
                <div className="space-y-2">
                  {companyContacts.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                        <span className="text-slate-400">{c.role}</span>
                      </div>
                      {c.email && <div className="text-slate-500">Email: {c.email}</div>}
                      {c.linkedIn && (
                        <a href={c.linkedIn} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                          LinkedIn Profile →
                        </a>
                      )}
                      {c.privateNotes && <p className="text-slate-600 dark:text-slate-400 italic">"{c.privateNotes}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => setSelectedOpportunity(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveModal}
            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Private Notes & Progress</span>
          </button>
        </div>

      </div>
    </div>
  );
};
