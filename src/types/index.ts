export type JobCategory =
  | 'Software Engineering'
  | 'Data Science'
  | 'Graduate Programme'
  | 'Internship'
  | 'Product & Design'
  | 'Finance & Fintech'
  | 'Cybersecurity'
  | 'Other';

export type WorkArrangement = 'Remote' | 'Hybrid' | 'On-site';

export type EmploymentType = 'Internship' | 'Graduate role' | 'Permanent' | 'Contract';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export enum ApplicationStatus {
  RESEARCHING = '🔍 Researching',
  NOT_STARTED = '⚪ Not started',
  PREPARING = '📝 Preparing application',
  APPLIED = '⏳ Applied — Waiting',
  INTERVIEW = '📞 Interview stage',
  OFFER = '🎉 Offer received',
  REJECTED = '❌ Rejected',
  CLOSED = '🚫 Closed / Missed',
  WITHDRAWN = '🔄 Withdrawn',
}

export interface JobOpportunity {
  id: string;
  companyName: string;
  companyLogo?: string;
  jobTitle: string;
  jobCategory: JobCategory;
  companyDescription: string;
  companyWebsite: string;
  applicationLink: string;
  location: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  dateAdded: string; // ISO format or YYYY-MM-DD
  openingDate?: string;
  closingDate: string; // YYYY-MM-DD
  generalNotes?: string;
  tags: string[];
  isShared: boolean;
}

export interface InterviewRecord {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  notes?: string;
  completed?: boolean;
}

export interface DocumentChecklist {
  cvReady: boolean;
  coverLetterReady: boolean;
  portfolioIncluded: boolean;
  transcriptIncluded: boolean;
  assessmentComplete: boolean;
}

export interface PersonalLink {
  id: string;
  title: string;
  url: string;
}

export interface UserApplicationState {
  opportunityId: string;
  status: ApplicationStatus;
  priority: PriorityLevel;
  dateApplied?: string;
  personalNotes: string;
  followUpDate?: string;
  interviewDates: InterviewRecord[];
  documentsPrepared: DocumentChecklist;
  personalLinks: PersonalLink[];
  lastUpdated: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  opportunityId?: string;
  role: string;
  email: string;
  linkedIn: string;
  howMet: string;
  dateContacted: string;
  lastInteractionDate: string;
  followUpDate?: string;
  privateNotes: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoBackupReminder: boolean;
  lastBackupDate?: string;
  defaultView: 'catalog' | 'kanban' | 'calendar' | 'dashboard';
}

export interface UserWorkspaceBackup {
  version: number;
  exportedAt: string;
  privateStates: Record<string, UserApplicationState>;
  contacts: Contact[];
  localOpportunities: JobOpportunity[];
  settings: UserSettings;
}
