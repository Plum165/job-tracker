import { apiClient } from './apiClient';
import { Contact, JobOpportunity, UserApplicationState, ApplicationStatus, PriorityLevel } from '../types';

export const JobTrackerAPI = {
  // --- JOBS ---
  async getVisibleJobs(_token?: string | null): Promise<JobOpportunity[]> {
    const res = await apiClient.get('/api/jobs');
    return res.data.data;
  },

  async getPublicJobs(_token?: string | null): Promise<JobOpportunity[]> {
    const res = await apiClient.get('/api/jobs/public');
    return res.data.data;
  },

  async getUserPrivateJobs(_token?: string | null): Promise<JobOpportunity[]> {
    const res = await apiClient.get('/api/jobs/mine');
    return res.data.data;
  },

  async createJob(_token: string | null | undefined, job: Partial<JobOpportunity>): Promise<JobOpportunity> {
    const res = await apiClient.post('/api/jobs', job);
    return res.data.data;
  },

  async updateJob(_token: string | null | undefined, jobId: string, job: Partial<JobOpportunity>): Promise<JobOpportunity> {
    const res = await apiClient.patch(`/api/jobs/${jobId}`, job);
    return res.data.data;
  },

  async deleteJob(_token: string | null | undefined, jobId: string): Promise<void> {
    await apiClient.delete(`/api/jobs/${jobId}`);
  },

  // --- APPLICATION STATES ---
  async getUserApplications(_token?: string | null): Promise<Record<string, UserApplicationState>> {
    const res = await apiClient.get('/api/applications');
    return res.data.data;
  },

  async saveApplicationState(
    _token: string | null | undefined,
    opportunityId: string,
    state: Partial<UserApplicationState>
  ): Promise<UserApplicationState> {
    const res = await apiClient.put(`/api/applications/${opportunityId}`, state);
    return res.data.data;
  },

  async updateStatus(
    _token: string | null | undefined,
    opportunityId: string,
    status: ApplicationStatus
  ): Promise<UserApplicationState> {
    const res = await apiClient.patch(`/api/applications/${opportunityId}/status`, { status });
    return res.data.data;
  },

  async updatePriority(
    _token: string | null | undefined,
    opportunityId: string,
    priority: PriorityLevel
  ): Promise<UserApplicationState> {
    const res = await apiClient.patch(`/api/applications/${opportunityId}/priority`, { priority });
    return res.data.data;
  },

  // --- CONTACTS ---
  async getContacts(_token?: string | null): Promise<Contact[]> {
    const res = await apiClient.get('/api/contacts');
    return res.data.data;
  },

  async createContact(_token: string | null | undefined, contact: Partial<Contact>): Promise<Contact> {
    const res = await apiClient.post('/api/contacts', contact);
    return res.data.data;
  },

  async updateContact(_token: string | null | undefined, contactId: string, contact: Partial<Contact>): Promise<Contact> {
    const res = await apiClient.patch(`/api/contacts/${contactId}`, contact);
    return res.data.data;
  },

  async deleteContact(_token: string | null | undefined, contactId: string): Promise<void> {
    await apiClient.delete(`/api/contacts/${contactId}`);
  },
};
