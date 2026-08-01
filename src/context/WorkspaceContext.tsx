import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { DEFAULT_SHARED_OPPORTUNITIES } from '../data/defaultCatalog';
import { exportOpportunitiesToExcel, ParsedExcelRow } from '../lib/excelParser';
import { WorkspaceStorage } from '../lib/storage';
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

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface WorkspaceContextType {
  // Navigation & View
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Display Options
  catalogViewMode: 'card' | 'table';
  setCatalogViewMode: (mode: 'card' | 'table') => void;

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
  filteredOpportunities: JobOpportunity[];
  privateStates: Record<string, UserApplicationState>;
  contacts: Contact[];
  settings: UserSettings;

  // Selected Detail Modal
  selectedOpportunity: JobOpportunity | null;
  setSelectedOpportunity: (opp: JobOpportunity | null) => void;
  isAddOpportunityOpen: boolean;
  setIsAddOpportunityOpen: (open: boolean) => void;

  // Data Actions
  getPrivateState: (oppId: string) => UserApplicationState;
  updateStatus: (oppId: string, status: ApplicationStatus) => void;
  updatePriority: (oppId: string, priority: PriorityLevel) => void;
  savePrivateState: (state: UserApplicationState) => void;
  saveLocalOpportunity: (opp: JobOpportunity, initialStatus?: ApplicationStatus, initialNotes?: string) => void;
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [catalogViewMode, setCatalogViewMode] = useState<'card' | 'table'>('card');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
  const [selectedWorkArrangement, setSelectedWorkArrangement] = useState<WorkArrangement | 'All'>('All');
  const [selectedLocation, setSelectedLocation] = useState<string | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'All'>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'closingDate' | 'dateAdded' | 'company' | 'priority'>('closingDate');

  // Storage persistent states
  const [localOpportunities, setLocalOpportunities] = useState<JobOpportunity[]>([]);
  const [privateStates, setPrivateStates] = useState<Record<string, UserApplicationState>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS_VAL);

  // Selected item modals
  const [selectedOpportunity, setSelectedOpportunity] = useState<JobOpportunity | null>(null);
  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);

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

  // Load storage data on mount
  useEffect(() => {
    setLocalOpportunities(WorkspaceStorage.getLocalOpportunities());
    setPrivateStates(WorkspaceStorage.getAllPrivateStates());
    setContacts(WorkspaceStorage.getAllContacts());
    setSettings(WorkspaceStorage.getSettings());
  }, []);

  // Combined opportunities (shared catalog + user local creations)
  const allOpportunities = [...DEFAULT_SHARED_OPPORTUNITIES, ...localOpportunities];

  // Filter & Sort Logic
  const filteredOpportunities = allOpportunities
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
          // Closed includes explicitly CLOSED, REJECTED, or past closing deadline
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

        // Put active upcoming deadlines at top, closed/past/rejected at bottom
        if (!isAInactive && isBInactive) return -1;
        if (isAInactive && !isBInactive) return 1;

        if (!isAInactive && !isBInactive) {
          return timeA - timeB; // Soonest active deadline first
        }
        return timeB - timeA; // Most recently closed/past deadline first at bottom
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
    return privateStates[oppId] || WorkspaceStorage.getPrivateState(oppId);
  };

  const updateStatus = (oppId: string, status: ApplicationStatus) => {
    const updated = WorkspaceStorage.updateStatus(oppId, status);
    setPrivateStates((prev) => ({ ...prev, [oppId]: updated }));

    // Confetti on Offer Received!
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

  const updatePriority = (oppId: string, priority: PriorityLevel) => {
    const updated = WorkspaceStorage.updatePriority(oppId, priority);
    setPrivateStates((prev) => ({ ...prev, [oppId]: updated }));
    addToast('Priority Set', `Priority level updated to ${priority}`, 'info');
  };

  const savePrivateState = (state: UserApplicationState) => {
    WorkspaceStorage.savePrivateState(state);
    setPrivateStates((prev) => ({ ...prev, [state.opportunityId]: state }));
    addToast('Saved', 'Personal application notes & progress updated', 'success');
  };

  const saveLocalOpportunity = (
    opp: JobOpportunity,
    initialStatus?: ApplicationStatus,
    initialNotes?: string
  ) => {
    const updatedLocals = WorkspaceStorage.saveLocalOpportunity(opp);
    setLocalOpportunities(updatedLocals);

    if (initialStatus || initialNotes) {
      const currentPrivate = getPrivateState(opp.id);
      const updatedPrivate: UserApplicationState = {
        ...currentPrivate,
        status: initialStatus || currentPrivate.status,
        personalNotes: initialNotes !== undefined ? initialNotes : currentPrivate.personalNotes,
      };
      savePrivateState(updatedPrivate);
    }

    addToast('Opportunity Saved', `${opp.companyName} - ${opp.jobTitle} saved to local opportunities`, 'success');
  };

  const deleteLocalOpportunity = (oppId: string) => {
    const updated = WorkspaceStorage.deleteLocalOpportunity(oppId);
    setLocalOpportunities(updated);
    addToast('Opportunity Removed', 'Local job opportunity deleted', 'info');
  };

  const saveContact = (contact: Contact) => {
    const updated = WorkspaceStorage.saveContact(contact);
    setContacts(updated);
    addToast('Contact Saved', `${contact.name} saved to your contacts network`, 'success');
  };

  const deleteContact = (contactId: string) => {
    const updated = WorkspaceStorage.deleteContact(contactId);
    setContacts(updated);
    addToast('Contact Removed', 'Contact deleted from network', 'info');
  };

  const importExcelRows = (rows: ParsedExcelRow[]) => {
    const validRows = rows.filter((r) => r.isValid && r.mapped.companyName && r.mapped.jobTitle);
    let count = 0;

    validRows.forEach((r) => {
      const opp = r.mapped as JobOpportunity;
      WorkspaceStorage.saveLocalOpportunity(opp);
      count++;

      if (r.initialStatus || r.initialNotes) {
        const pState = WorkspaceStorage.getPrivateState(opp.id);
        WorkspaceStorage.savePrivateState({
          ...pState,
          status: r.initialStatus || pState.status,
          personalNotes: r.initialNotes || pState.personalNotes,
        });
      }
    });

    setLocalOpportunities(WorkspaceStorage.getLocalOpportunities());
    setPrivateStates(WorkspaceStorage.getAllPrivateStates());
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
    exportOpportunitiesToExcel(allOpportunities, privateStates);
    addToast('Excel Exported', 'Spreadsheet generated and downloaded!', 'success');
  };

  const clearAllData = () => {
    WorkspaceStorage.clearAllWorkspaceData();
    setLocalOpportunities([]);
    setPrivateStates({});
    setContacts([]);
    setSettings(DEFAULT_SETTINGS_VAL);
    addToast('Local Storage Cleared', 'Reset to initial catalog state.', 'info');
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = WorkspaceStorage.saveSettings(newSettings);
    setSettings(updated);
    addToast('Settings Saved', 'Preferences updated', 'success');
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        catalogViewMode,
        setCatalogViewMode,
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
        allOpportunities,
        filteredOpportunities,
        privateStates,
        contacts,
        settings,
        selectedOpportunity,
        setSelectedOpportunity,
        isAddOpportunityOpen,
        setIsAddOpportunityOpen,
        getPrivateState,
        updateStatus,
        updatePriority,
        savePrivateState,
        saveLocalOpportunity,
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

const DEFAULT_SETTINGS_VAL: UserSettings = {
  theme: 'system',
  autoBackupReminder: true,
  defaultView: 'catalog',
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
