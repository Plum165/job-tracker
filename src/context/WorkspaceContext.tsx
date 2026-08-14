import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_SHARED_OPPORTUNITIES } from '../data/defaultCatalog';
import { exportOpportunitiesToExcel, ParsedExcelRow } from '../lib/excelParser';
import { WorkspaceStorage, createDefaultApplicationState } from '../lib/storage';
import { JobTrackerAPI } from '../lib/api';
import { useAuth } from './AuthContext';
import {
  ApplicationStatus,
  Contact,
  JobCategory,
  JobOpportunity,
  PriorityLevel,
  UserApplicationState,
  UserSettings,
  WorkArrangement,
} from '../types';

export type ActiveTab = 'dashboard' | 'catalog' | 'kanban' | 'calendar' | 'contacts' | 'data';
export type CatalogScope = 'all' | 'public' | 'private';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

const DEFAULT_SETTINGS_VAL: UserSettings = {
  theme: 'system',
  autoBackupReminder: true,
  defaultView: 'catalog',
};

function parseLocalDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    if (Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function isOpportunityExpired(opp: JobOpportunity): boolean {
  const closingDate = parseLocalDate(opp.closingDate);
  if (!closingDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return closingDate.getTime() < today.getTime();
}

interface WorkspaceContextType {
  // Navigation & View
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Display & Scope Options
  catalogViewMode: 'card' | 'table';
  setCatalogViewMode: (mode: 'card' | 'table') => void;
  catalogScope: CatalogScope;
  setCatalogScope: (scope: CatalogScope) => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: JobCategory | 'All';
  setSelectedCategory: (cat: JobCategory | 'All') => void;
  selectedStatus: ApplicationStatus | 'All';
  setSelectedStatus: (status: ApplicationStatus | 'All') => void;
  selectedWorkArrangement: WorkArrangement | 'All';
  setSelectedWorkArrangement: (wa: WorkArrangement | 'All') => void;
  selectedLocation: string | 'All';
  setSelectedLocation: (loc: string | 'All') => void;
  selectedPriority: PriorityLevel | 'All';
  setSelectedPriority: (priority: PriorityLevel | 'All') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  sortBy: 'closingDate' | 'dateAdded' | 'company' | 'priority';
  setSortBy: (sort: 'closingDate' | 'dateAdded' | 'company' | 'priority') => void;
  resetFilters: () => void;

  // Data Collections
  allOpportunities: JobOpportunity[];
  publicOpportunities: JobOpportunity[];
  privateOpportunities: JobOpportunity[];
  filteredOpportunities: JobOpportunity[];
  privateStates: Record<string, UserApplicationState>;
  contacts: Contact[];
  settings: UserSettings;
  isSyncingData: boolean;

  // Selected Detail Modal
  selectedOpportunity: JobOpportunity | null;
  setSelectedOpportunity: (opp: JobOpportunity | null) => void;
  isAddOpportunityOpen: boolean;
  setIsAddOpportunityOpen: (open: boolean) => void;
  editingOpportunity: JobOpportunity | null;
  startEditingOpportunity: (opp: JobOpportunity) => void;

  // Data Actions
  getPrivateState: (oppId: string) => UserApplicationState;
  updateStatus: (oppId: string, status: ApplicationStatus) => void;
  updatePriority: (oppId: string, priority: PriorityLevel) => void;
  savePrivateState: (state: UserApplicationState) => void;
  saveLocalOpportunity: (opp: JobOpportunity, initialStatus?: ApplicationStatus, initialNotes?: string) => void;
  updateOpportunity: (oppId: string, updates: Partial<JobOpportunity>) => Promise<void>;
  copyOpportunityToPrivate: (opp: JobOpportunity) => Promise<void>;
  deleteLocalOpportunity: (oppId: string) => void;
  saveContact: (contact: Contact) => void;
  deleteContact: (contactId: string) => void;
  importExcelRows: (rows: ParsedExcelRow[]) => void;
  importBackupJSON: (jsonStr: string) => boolean;
  exportBackupJSON: () => void;
  exportToExcel: () => void;
  clearAllData: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Toast System
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tokens, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [catalogViewMode, setCatalogViewMode] = useState<'card' | 'table'>('card');
  const [catalogScope, setCatalogScope] = useState<CatalogScope>('all');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
  const [selectedWorkArrangement, setSelectedWorkArrangement] = useState<WorkArrangement | 'All'>('All');
  const [selectedLocation, setSelectedLocation] = useState<string | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'closingDate' | 'dateAdded' | 'company' | 'priority'>('closingDate');

  // Persistent states
  const [serverOpportunities, setServerOpportunities] = useState<JobOpportunity[]>([]);
  const [localOpportunities, setLocalOpportunities] = useState<JobOpportunity[]>([]);
  const [privateStates, setPrivateStates] = useState<Record<string, UserApplicationState>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS_VAL);
  const [isSyncingData, setIsSyncingData] = useState<boolean>(false);

  // Selected item modals
  const [selectedOpportunity, setSelectedOpportunity] = useState<JobOpportunity | null>(null);
  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<JobOpportunity | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data with authenticated backend
  useEffect(() => {
    const loadBackendData = async () => {
      if (isAuthenticated && tokens?.accessToken) {
        setIsSyncingData(true);
        try {
          const [publicJobsData, privateJobsData, appsData, contactsData] = await Promise.all([
            JobTrackerAPI.getPublicJobs(tokens.accessToken).catch(() => []),
            JobTrackerAPI.getUserPrivateJobs(tokens.accessToken).catch(() => []),
            JobTrackerAPI.getUserApplications(tokens.accessToken).catch(() => ({})),
            JobTrackerAPI.getContacts(tokens.accessToken).catch(() => []),
          ]);

          const activeDefaultOpportunities = DEFAULT_SHARED_OPPORTUNITIES.filter((opp) => !isOpportunityExpired(opp));
          const publicJobs = Array.isArray(publicJobsData) && publicJobsData.length > 0
            ? publicJobsData
            : activeDefaultOpportunities;
          const privateJobs = Array.isArray(privateJobsData) ? privateJobsData : [];
          setServerOpportunities([...publicJobs, ...privateJobs]);
          setLocalOpportunities([]);

          if (appsData && typeof appsData === 'object') {
            setPrivateStates(appsData as Record<string, UserApplicationState>);
          } else {
            setPrivateStates(WorkspaceStorage.getAllPrivateStates());
          }

          if (Array.isArray(contactsData)) {
            setContacts(contactsData);
          } else {
            setContacts(WorkspaceStorage.getAllContacts());
          }
        } catch (err) {
          console.warn('Backend sync warning, falling back to storage:', err);
          setServerOpportunities(DEFAULT_SHARED_OPPORTUNITIES);
          setLocalOpportunities(WorkspaceStorage.getLocalOpportunities());
          setPrivateStates(WorkspaceStorage.getAllPrivateStates());
          setContacts(WorkspaceStorage.getAllContacts());
        } finally {
          setIsSyncingData(false);
        }
      } else {
        // Fallback for offline or unauthenticated browsing
        setServerOpportunities(DEFAULT_SHARED_OPPORTUNITIES);
        setLocalOpportunities(WorkspaceStorage.getLocalOpportunities());
        setPrivateStates(WorkspaceStorage.getAllPrivateStates());
        setContacts(WorkspaceStorage.getAllContacts());
        setSettings(WorkspaceStorage.getSettings());
      }
    };

    loadBackendData();
  }, [isAuthenticated, tokens?.accessToken]);

  // Combined opportunities (Shared catalog + User created jobs)
  const activeDefaultOpportunities = DEFAULT_SHARED_OPPORTUNITIES.filter((opp) => !isOpportunityExpired(opp));
  const baseOpportunities = isAuthenticated && serverOpportunities.length > 0
    ? serverOpportunities
    : [...activeDefaultOpportunities, ...localOpportunities];

  const publicOpportunities = baseOpportunities.filter((opp) => opp.isShared && !isOpportunityExpired(opp));
  const privateOpportunities = baseOpportunities.filter((opp) => !opp.isShared);

  // Scope filtering (All, Public Catalogue, Private Catalogue)
  const scopeFilteredOpportunities = baseOpportunities.filter((opp) => {
    if (catalogScope === 'public') return opp.isShared && !isOpportunityExpired(opp);
    if (catalogScope === 'private') return !opp.isShared;
    return true;
  });

  // Filter & Sort Logic
  const filteredOpportunities = scopeFilteredOpportunities
    .filter((opp) => {
      const pState = privateStates[opp.id] || WorkspaceStorage.getPrivateState(opp.id);

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchComp = opp.companyName.toLowerCase().includes(query);
        const matchTitle = opp.jobTitle.toLowerCase().includes(query);
        const matchDesc = opp.companyDescription.toLowerCase().includes(query);
        const matchLocation = opp.location.toLowerCase().includes(query);
        const matchTag = opp.tags.some((t) => t.toLowerCase().includes(query));
        const matchNotes = pState.personalNotes?.toLowerCase().includes(query);
        if (!matchComp && !matchTitle && !matchDesc && !matchLocation && !matchTag && !matchNotes) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && opp.jobCategory !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All') {
        if (selectedStatus === ApplicationStatus.CLOSED) {
          const isPast = new Date(opp.closingDate).getTime() < new Date().setHours(0, 0, 0, 0);
          if (
            pState.status !== ApplicationStatus.CLOSED &&
            pState.status !== ApplicationStatus.REJECTED &&
            !isPast
          ) {
            return false;
          }
        } else if (selectedStatus === ApplicationStatus.REJECTED) {
          if (pState.status !== ApplicationStatus.REJECTED) {
            return false;
          }
        } else {
          if (pState.status !== selectedStatus) {
            return false;
          }
        }
      }

      // Work arrangement
      if (selectedWorkArrangement !== 'All' && opp.workArrangement !== selectedWorkArrangement) {
        return false;
      }

      // Location filter
      if (selectedLocation !== 'All') {
        if (!opp.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Priority
      if (selectedPriority !== 'All' && pState.priority !== selectedPriority) {
        return false;
      }

      // Tag
      if (selectedTag && !opp.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const pA = privateStates[a.id] || WorkspaceStorage.getPrivateState(a.id);
      const pB = privateStates[b.id] || WorkspaceStorage.getPrivateState(b.id);

      if (sortBy === 'closingDate') {
        const todayMs = new Date().setHours(0, 0, 0, 0);
        const timeA = new Date(a.closingDate).getTime();
        const timeB = new Date(b.closingDate).getTime();

        const isAInactive =
          timeA < todayMs ||
          [ApplicationStatus.REJECTED, ApplicationStatus.CLOSED, ApplicationStatus.WITHDRAWN].includes(
            pA.status
          );
        const isBInactive =
          timeB < todayMs ||
          [ApplicationStatus.REJECTED, ApplicationStatus.CLOSED, ApplicationStatus.WITHDRAWN].includes(
            pB.status
          );

        if (!isAInactive && isBInactive) return -1;
        if (isAInactive && !isBInactive) return 1;

        if (!isAInactive && !isBInactive) {
          return timeA - timeB;
        }
        return timeB - timeA;
      }
      if (sortBy === 'dateAdded') {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      if (sortBy === 'priority') {
        const prioRank = { High: 3, Medium: 2, Low: 1 };
        return prioRank[pB.priority] - prioRank[pA.priority];
      }
      return 0;
    });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedWorkArrangement('All');
    setSelectedLocation('All');
    setSelectedPriority('All');
    setSelectedTag(null);
    setSortBy('closingDate');
  };

  // Actions
  const getPrivateState = (oppId: string): UserApplicationState => {
    if (privateStates[oppId]) return privateStates[oppId];
    return WorkspaceStorage.getPrivateState(oppId);
  };

  const updateStatus = async (oppId: string, status: ApplicationStatus) => {
    const current = getPrivateState(oppId);
    const updatedState: UserApplicationState = {
      ...current,
      status,
      dateApplied:
        status === ApplicationStatus.APPLIED && !current.dateApplied
          ? new Date().toISOString().split('T')[0]
          : current.dateApplied,
    };

    setPrivateStates((prev) => ({ ...prev, [oppId]: updatedState }));
    WorkspaceStorage.updateStatus(oppId, status);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.updateStatus(tokens.accessToken, oppId, status);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    if (status === ApplicationStatus.OFFER) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      addToast('🎉 Offer Received!', 'Congratulations on receiving a job offer!', 'success');
    } else {
      addToast('Status Updated', `Application status changed to ${status}`, 'info');
    }
  };

  const updatePriority = async (oppId: string, priority: PriorityLevel) => {
    const current = getPrivateState(oppId);
    const updatedState: UserApplicationState = { ...current, priority };

    setPrivateStates((prev) => ({ ...prev, [oppId]: updatedState }));
    WorkspaceStorage.updatePriority(oppId, priority);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.updatePriority(tokens.accessToken, oppId, priority);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    addToast('Priority Set', `Priority level updated to ${priority}`, 'info');
  };

  const savePrivateState = async (state: UserApplicationState) => {
    setPrivateStates((prev) => ({ ...prev, [state.opportunityId]: state }));
    WorkspaceStorage.savePrivateState(state);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.saveApplicationState(tokens.accessToken, state.opportunityId, state);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    addToast('Saved', 'Personal application notes & progress updated', 'success');
  };

  const saveLocalOpportunity = async (
    opp: JobOpportunity,
    initialStatus?: ApplicationStatus,
    initialNotes?: string
  ) => {
    setLocalOpportunities((prev) => [opp, ...prev.filter((o) => o.id !== opp.id)]);
    setServerOpportunities((prev) => [opp, ...prev.filter((o) => o.id !== opp.id)]);
    WorkspaceStorage.saveLocalOpportunity(opp);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.createJob(tokens.accessToken, opp);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    if (initialStatus || initialNotes) {
      const currentPrivate = getPrivateState(opp.id);
      const updatedPrivate: UserApplicationState = {
        ...currentPrivate,
        status: initialStatus || currentPrivate.status,
        personalNotes: initialNotes !== undefined ? initialNotes : currentPrivate.personalNotes,
      };
      savePrivateState(updatedPrivate);
    } else {
      addToast('Opportunity Saved', `${opp.companyName} - ${opp.jobTitle} saved to opportunities`, 'success');
    }
  };

  const updateOpportunity = async (oppId: string, updates: Partial<JobOpportunity>) => {
    const existing = baseOpportunities.find((opp) => opp.id === oppId);
    if (!existing) {
      addToast('Update Failed', 'The selected job could not be found.', 'error');
      return;
    }

    const updatedOpportunity = { ...existing, ...updates };
    setServerOpportunities((prev) => prev.map((opp) => (opp.id === oppId ? updatedOpportunity : opp)));
    setLocalOpportunities((prev) => prev.map((opp) => (opp.id === oppId ? updatedOpportunity : opp)));
    if (selectedOpportunity?.id === oppId) {
      setSelectedOpportunity(updatedOpportunity);
    }

    if (isAuthenticated && tokens?.accessToken) {
      try {
        const persisted = await JobTrackerAPI.updateJob(tokens.accessToken, oppId, updates);
        setServerOpportunities((prev) => prev.map((opp) => (opp.id === oppId ? persisted : opp)));
        if (selectedOpportunity?.id === oppId) {
          setSelectedOpportunity(persisted);
        }
        addToast('Job Updated', `${persisted.companyName} - ${persisted.jobTitle} was saved.`, 'success');
      } catch (e: any) {
        setServerOpportunities((prev) => prev.map((opp) => (opp.id === oppId ? existing : opp)));
        setLocalOpportunities((prev) => prev.map((opp) => (opp.id === oppId ? existing : opp)));
        setSelectedOpportunity(existing);
        addToast('Update Failed', e?.message || 'Could not save job changes.', 'error');
        throw e;
      }
    } else {
      WorkspaceStorage.saveLocalOpportunity(updatedOpportunity);
      addToast('Job Updated', `${updatedOpportunity.companyName} - ${updatedOpportunity.jobTitle} was saved locally.`, 'success');
    }
  };

  const copyOpportunityToPrivate = async (opp: JobOpportunity) => {
    const copiedOpportunity: JobOpportunity = {
      ...opp,
      id: `private-copy-${opp.id}-${Date.now()}`,
      isShared: false,
      createdById: undefined,
      dateAdded: new Date().toISOString().split('T')[0],
      tags: Array.from(new Set([...(opp.tags || []), 'Saved'])),
    };

    await saveLocalOpportunity(copiedOpportunity, ApplicationStatus.NOT_STARTED, '');
    addToast('Copied to Private Catalogue', `${opp.companyName} - ${opp.jobTitle} is now in your private catalogue.`, 'success');
  };

  const startEditingOpportunity = (opp: JobOpportunity) => {
    setEditingOpportunity(opp);
    setSelectedOpportunity(null);
    setIsAddOpportunityOpen(true);
  };

  const deleteLocalOpportunity = async (oppId: string) => {
    setLocalOpportunities((prev) => prev.filter((o) => o.id !== oppId));
    setServerOpportunities((prev) => prev.filter((o) => o.id !== oppId));
    WorkspaceStorage.deleteLocalOpportunity(oppId);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.deleteJob(tokens.accessToken, oppId);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    addToast('Opportunity Removed', 'Job opportunity deleted', 'info');
  };

  const saveContact = async (contact: Contact) => {
    setContacts((prev) => {
      const idx = prev.findIndex((c) => c.id === contact.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = contact;
        return copy;
      }
      return [contact, ...prev];
    });
    WorkspaceStorage.saveContact(contact);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        const existing = contacts.find((c) => c.id === contact.id);
        if (existing) {
          await JobTrackerAPI.updateContact(tokens.accessToken, contact.id, contact);
        } else {
          await JobTrackerAPI.createContact(tokens.accessToken, contact);
        }
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    addToast('Contact Saved', `${contact.name} saved to your contacts network`, 'success');
  };

  const deleteContact = async (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    WorkspaceStorage.deleteContact(contactId);

    if (isAuthenticated && tokens?.accessToken) {
      try {
        await JobTrackerAPI.deleteContact(tokens.accessToken, contactId);
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }

    addToast('Contact Removed', 'Contact deleted from network', 'info');
  };

  const importExcelRows = (rows: ParsedExcelRow[]) => {
    const validRows = rows.filter((r) => r.isValid && r.mapped.companyName && r.mapped.jobTitle);
    let count = 0;

    validRows.forEach((r) => {
      const opp = r.mapped as JobOpportunity;
      saveLocalOpportunity(opp, r.initialStatus, r.initialNotes);
      count++;
    });

    addToast('Excel Import Complete', `Successfully imported ${count} job opportunities from spreadsheet!`, 'success');
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    const res = WorkspaceStorage.importBackupJSON(jsonStr);
    if (res.success) {
      setLocalOpportunities(WorkspaceStorage.getLocalOpportunities());
      setPrivateStates(WorkspaceStorage.getAllPrivateStates());
      setContacts(WorkspaceStorage.getAllContacts());
      setSettings(WorkspaceStorage.getSettings());
      addToast('Workspace Restored', res.message, 'success');
      return true;
    } else {
      addToast('Import Failed', res.message, 'error');
      return false;
    }
  };

  const exportBackupJSON = () => {
    const jsonStr = WorkspaceStorage.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Opportunity_Hub_Private_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Backup Exported', 'Downloaded private workspace JSON file', 'success');
  };

  const exportToExcel = () => {
    exportOpportunitiesToExcel(baseOpportunities, privateStates);
    addToast('Excel Exported', 'Spreadsheet generated and downloaded!', 'success');
  };

  const clearAllData = () => {
    WorkspaceStorage.clearAllWorkspaceData();
    setLocalOpportunities([]);
    setServerOpportunities(DEFAULT_SHARED_OPPORTUNITIES);
    setPrivateStates({});
    setContacts([]);
    setSettings(DEFAULT_SETTINGS_VAL);
    addToast('Local Storage Cleared', 'Reset to initial catalog state.', 'info');
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = WorkspaceStorage.saveSettings(newSettings);
    setSettings(updated);
    addToast('Settings Updated', 'Preferences saved', 'success');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        catalogViewMode,
        setCatalogViewMode,
        catalogScope,
        setCatalogScope,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        selectedWorkArrangement,
        setSelectedWorkArrangement,
        selectedLocation,
        setSelectedLocation,
        selectedPriority,
        setSelectedPriority,
        selectedTag,
        setSelectedTag,
        sortBy,
        setSortBy,
        resetFilters,
        allOpportunities: baseOpportunities,
        publicOpportunities,
        privateOpportunities,
        filteredOpportunities,
        privateStates,
        contacts,
        settings,
        isSyncingData,
        selectedOpportunity,
        setSelectedOpportunity,
        isAddOpportunityOpen,
        setIsAddOpportunityOpen: (open: boolean) => {
          setIsAddOpportunityOpen(open);
          if (!open) setEditingOpportunity(null);
        },
        editingOpportunity,
        startEditingOpportunity,
        getPrivateState,
        updateStatus,
        updatePriority,
        savePrivateState,
        saveLocalOpportunity,
        updateOpportunity,
        copyOpportunityToPrivate,
        deleteLocalOpportunity,
        saveContact,
        deleteContact,
        importExcelRows,
        importBackupJSON,
        exportBackupJSON,
        exportToExcel,
        clearAllData,
        updateSettings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
