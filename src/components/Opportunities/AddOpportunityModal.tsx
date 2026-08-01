import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  ApplicationStatus,
  EmploymentType,
  JobCategory,
  JobOpportunity,
  WorkArrangement,
} from '../../types';
import { Plus, X } from 'lucide-react';

export const AddOpportunityModal: React.FC = () => {
  const { isAddOpportunityOpen, setIsAddOpportunityOpen, saveLocalOpportunity } = useWorkspace();

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState<JobCategory>('Software Engineering');
  const [location, setLocation] = useState('South Africa / Hybrid');
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>('Hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Graduate role');
  const [closingDate, setClosingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [applicationLink, setApplicationLink] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus>(ApplicationStatus.NOT_STARTED);
  const [initialNotes, setInitialNotes] = useState('');
  const [tagsStr, setTagsStr] = useState('Tech, Custom');

  if (!isAddOpportunityOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;

    const newOpp: JobOpportunity = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyName,
      jobTitle,
      jobCategory,
      location,
      workArrangement,
      employmentType,
      dateAdded: new Date().toISOString().split('T')[0],
      closingDate,
      applicationLink: applicationLink.startsWith('http') ? applicationLink : `https://${applicationLink || 'google.com'}`,
      companyWebsite: companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite || 'google.com'}`,
      companyDescription: companyDescription || `${jobTitle} opportunity at ${companyName}.`,
      tags: tagsStr.split(/[,;]/).map((t) => t.trim()).filter(Boolean),
      isShared: false,
    };

    saveLocalOpportunity(newOpp, initialStatus, initialNotes);
    setIsAddOpportunityOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-4 sm:my-8 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add Opportunity
            </h3>
          </div>
          <button
            onClick={() => setIsAddOpportunityOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="E.g. Senwes, AWS, Takealot"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 sm:p-2 text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Title / Position *
              </label>
              <input
                type="text"
                required
                placeholder="E.g. Graduate Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-2.5 sm:p-2 text-sm sm:text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value as JobCategory)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data Science">Data Science</option>
                <option value="Graduate Programme">Graduate Programme</option>
                <option value="Internship">Internship</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Finance & Fintech">Finance & Fintech</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work Arrangement</label>
              <select
                value={workArrangement}
                onChange={(e) => setWorkArrangement(e.target.value as WorkArrangement)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              >
                <option value="Graduate role">Graduate role</option>
                <option value="Internship">Internship</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
              <input
                type="text"
                placeholder="E.g. Cape Town / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Closing Date</label>
              <input
                type="date"
                required
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Application / Job Link</label>
            <input
              type="text"
              placeholder="https://company.com/careers/job-123"
              value={applicationLink}
              onChange={(e) => setApplicationLink(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of company & role..."
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400">Your Initial Private Application Tracker State</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial My Status</label>
                <select
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold"
                >
                  {Object.values(ApplicationStatus).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Private Notes</label>
              <textarea
                rows={2}
                placeholder="E.g. Spoke to alumni on LinkedIn..."
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddOpportunityOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Save Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
