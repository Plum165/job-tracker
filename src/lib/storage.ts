import { DEFAULT_INITIAL_PRIVATE_STATES } from '../data/defaultCatalog';
import {
  ApplicationStatus,
  Contact,
  JobOpportunity,
  PriorityLevel,
  UserApplicationState,
  UserSettings,
  UserWorkspaceBackup,
} from '../types';

const STORAGE_KEYS = {
  PRIVATE_STATES: 'opt_hub_private_states_v1',
  CONTACTS: 'opt_hub_contacts_v1',
  LOCAL_OPPORTUNITIES: 'opt_hub_local_opportunities_v1',
  SETTINGS: 'opt_hub_settings_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  autoBackupReminder: true,
  defaultView: 'catalog',
};

/**
 * Creates a clean default application state for an opportunity
 */
export function createDefaultApplicationState(
  opportunityId: string
): UserApplicationState {
  return {
    opportunityId,
    status: ApplicationStatus.NOT_STARTED,
    priority: 'Medium',
    personalNotes: '',
    interviewDates: [],
    documentsPrepared: {
      cvReady: false,
      coverLetterReady: false,
      portfolioIncluded: false,
      transcriptIncluded: false,
      assessmentComplete: false,
    },
    personalLinks: [],
    lastUpdated: new Date().toISOString(),
  };
}

/* LocalStorage wrapper with fallback error handling */
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save key ${key} to localStorage`, err);
  }
}

/**
 * Storage API Interface for Private Personal Workspace
 */
export const WorkspaceStorage = {
  // --- PRIVATE STATES ---
  getAllPrivateStates(): Record<string, UserApplicationState> {
    return getItem<Record<string, UserApplicationState>>(
      STORAGE_KEYS.PRIVATE_STATES,
      {}
    );
  },

  getPrivateState(opportunityId: string): UserApplicationState {
    const all = this.getAllPrivateStates();
    if (all[opportunityId]) {
      return all[opportunityId];
    }
    const defaultState = createDefaultApplicationState(opportunityId);
    if (DEFAULT_INITIAL_PRIVATE_STATES[opportunityId]) {
      return {
        ...defaultState,
        ...DEFAULT_INITIAL_PRIVATE_STATES[opportunityId],
      };
    }
    return defaultState;
  },

  savePrivateState(state: UserApplicationState): void {
    const all = this.getAllPrivateStates();
    all[state.opportunityId] = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PRIVATE_STATES, all);
  },

  updateStatus(opportunityId: string, status: ApplicationStatus): UserApplicationState {
    const current = this.getPrivateState(opportunityId);
    const updated: UserApplicationState = {
      ...current,
      status,
      dateApplied:
        status === ApplicationStatus.APPLIED && !current.dateApplied
          ? new Date().toISOString().split('T')[0]
          : current.dateApplied,
    };
    this.savePrivateState(updated);
    return updated;
  },

  updatePriority(opportunityId: string, priority: PriorityLevel): UserApplicationState {
    const current = this.getPrivateState(opportunityId);
    const updated: UserApplicationState = {
      ...current,
      priority,
    };
    this.savePrivateState(updated);
    return updated;
  },

  // --- CONTACTS ---
  getAllContacts(): Contact[] {
    return getItem<Contact[]>(STORAGE_KEYS.CONTACTS, []);
  },

  saveContact(contact: Contact): Contact[] {
    const contacts = this.getAllContacts();
    const existingIndex = contacts.findIndex((c) => c.id === contact.id);
    if (existingIndex >= 0) {
      contacts[existingIndex] = contact;
    } else {
      contacts.push(contact);
    }
    setItem(STORAGE_KEYS.CONTACTS, contacts);
    return contacts;
  },

  deleteContact(contactId: string): Contact[] {
    const contacts = this.getAllContacts().filter((c) => c.id !== contactId);
    setItem(STORAGE_KEYS.CONTACTS, contacts);
    return contacts;
  },

  // --- LOCAL CUSTOM OPPORTUNITIES ---
  getLocalOpportunities(): JobOpportunity[] {
    return getItem<JobOpportunity[]>(STORAGE_KEYS.LOCAL_OPPORTUNITIES, []);
  },

  saveLocalOpportunity(opp: JobOpportunity): JobOpportunity[] {
    const localOpps = this.getLocalOpportunities();
    const existingIndex = localOpps.findIndex((o) => o.id === opp.id);
    if (existingIndex >= 0) {
      localOpps[existingIndex] = opp;
    } else {
      localOpps.unshift(opp);
    }
    setItem(STORAGE_KEYS.LOCAL_OPPORTUNITIES, localOpps);
    return localOpps;
  },

  deleteLocalOpportunity(oppId: string): JobOpportunity[] {
    const localOpps = this.getLocalOpportunities().filter((o) => o.id !== oppId);
    setItem(STORAGE_KEYS.LOCAL_OPPORTUNITIES, localOpps);
    return localOpps;
  },

  // --- SETTINGS ---
  getSettings(): UserSettings {
    return getItem<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --- IMPORT / EXPORT / CLEAR ---
  exportBackupJSON(): string {
    const backup: UserWorkspaceBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      privateStates: this.getAllPrivateStates(),
      contacts: this.getAllContacts(),
      localOpportunities: this.getLocalOpportunities(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr) as Partial<UserWorkspaceBackup>;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON backup format.' };
      }

      if (parsed.privateStates && typeof parsed.privateStates === 'object') {
        setItem(STORAGE_KEYS.PRIVATE_STATES, parsed.privateStates);
      }
      if (Array.isArray(parsed.contacts)) {
        setItem(STORAGE_KEYS.CONTACTS, parsed.contacts);
      }
      if (Array.isArray(parsed.localOpportunities)) {
        setItem(STORAGE_KEYS.LOCAL_OPPORTUNITIES, parsed.localOpportunities);
      }
      if (parsed.settings) {
        setItem(STORAGE_KEYS.SETTINGS, parsed.settings);
      }

      return {
        success: true,
        message: 'Private workspace successfully imported and restored!',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error during import.';
      return { success: false, message: `Import failed: ${msg}` };
    }
  },

  clearAllWorkspaceData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRIVATE_STATES);
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_OPPORTUNITIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
