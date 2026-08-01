import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateDisplay } from '../../lib/dateUtils';
import { Contact } from '../../types';
import {
  Briefcase,
  ExternalLink,
  Mail,
  Plus,
  Search,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const { contacts, saveContact, deleteContact, allOpportunities } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Contact form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [howMet, setHowMet] = useState('');
  const [dateContacted, setDateContacted] = useState(() => new Date().toISOString().split('T')[0]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [opportunityId, setOpportunityId] = useState('');

  const openNewForm = () => {
    setEditingContact(null);
    setName('');
    setCompany('');
    setRole('Recruiter / Talent Acquisition');
    setEmail('');
    setLinkedIn('');
    setHowMet('LinkedIn Outreach');
    setDateContacted(new Date().toISOString().split('T')[0]);
    setFollowUpDate('');
    setPrivateNotes('');
    setOpportunityId('');
    setIsFormOpen(true);
  };

  const openEditForm = (c: Contact) => {
    setEditingContact(c);
    setName(c.name);
    setCompany(c.company);
    setRole(c.role);
    setEmail(c.email);
    setLinkedIn(c.linkedIn);
    setHowMet(c.howMet);
    setDateContacted(c.dateContacted);
    setFollowUpDate(c.followUpDate || '');
    setPrivateNotes(c.privateNotes);
    setOpportunityId(c.opportunityId || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const contactObj: Contact = {
      id: editingContact ? editingContact.id : `contact-${Date.now()}`,
      name,
      company: company || 'Tech Industry',
      role: role || 'Recruiter',
      email,
      linkedIn: linkedIn.startsWith('http') ? linkedIn : linkedIn ? `https://${linkedIn}` : '',
      howMet,
      dateContacted,
      lastInteractionDate: new Date().toISOString().split('T')[0],
      followUpDate,
      privateNotes,
      opportunityId,
    };

    saveContact(contactObj);
    setIsFormOpen(false);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.privateNotes.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>Recruiter & Professional Contacts Network</span>
          </h2>
          <p className="text-xs text-slate-500">
            Keep track of recruiters, engineering managers, and alumni contacts. Stored 100% locally on your device.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name, company, role, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Contacts List Grid */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <User className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No contacts saved yet.
          </p>
          <button
            onClick={openNewForm}
            className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl"
          >
            + Add your first recruiter contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.name}</h3>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {c.role} at <strong className="text-slate-800 dark:text-slate-200">{c.company}</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 hover:underline truncate"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </a>
                )}

                {c.linkedIn && (
                  <a
                    href={c.linkedIn}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>LinkedIn Profile</span>
                  </a>
                )}

                {c.privateNotes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{c.privateNotes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Contacted: {formatDateDisplay(c.dateContacted)}</span>
                <button
                  onClick={() => openEditForm(c)}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Edit details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingContact ? 'Edit Recruiter Contact' : 'Add New Contact'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Company *</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Role / Title</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">LinkedIn Profile URL</label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Link to Opportunity</label>
                <select
                  value={opportunityId}
                  onChange={(e) => setOpportunityId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  <option value="">-- Unlinked / General Contact --</option>
                  {allOpportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.companyName} - {o.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Private Notes & Interactivity History</label>
                <textarea
                  rows={3}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  placeholder="E.g. Met at Cape Town tech fair. Follow up next week..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
