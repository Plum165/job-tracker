import { Contact, JobOpportunity, UserApplicationState, ApplicationStatus, PriorityLevel } from '../types';

async function fetchWithAuth<T>(
  url: string,
  token: string | null | undefined,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `API request failed with status ${res.status}`);
  }

  return json.data as T;
}

export const JobTrackerAPI = {
  // --- JOBS ---
  async getVisibleJobs(token: string | null | undefined): Promise<JobOpportunity[]> {
    if (!token) return [];
    return fetchWithAuth<JobOpportunity[]>('/api/jobs', token);
  },

  async getPublicJobs(token: string | null | undefined): Promise<JobOpportunity[]> {
    if (!token) return [];
    return fetchWithAuth<JobOpportunity[]>('/api/jobs/public', token);
  },

  async getUserPrivateJobs(token: string | null | undefined): Promise<JobOpportunity[]> {
    if (!token) return [];
    return fetchWithAuth<JobOpportunity[]>('/api/jobs/mine', token);
  },

  async createJob(token: string | null | undefined, job: Partial<JobOpportunity>): Promise<JobOpportunity> {
    return fetchWithAuth<JobOpportunity>('/api/jobs', token, {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  async updateJob(token: string | null | undefined, jobId: string, job: Partial<JobOpportunity>): Promise<JobOpportunity> {
    return fetchWithAuth<JobOpportunity>(`/api/jobs/${jobId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(job),
    });
  },

  async deleteJob(token: string | null | undefined, jobId: string): Promise<void> {
    await fetchWithAuth<void>(`/api/jobs/${jobId}`, token, {
      method: 'DELETE',
    });
  },

  // --- APPLICATION STATES ---
  async getUserApplications(token: string | null | undefined): Promise<Record<string, UserApplicationState>> {
    if (!token) return {};
    return fetchWithAuth<Record<string, UserApplicationState>>('/api/applications', token);
  },

  async saveApplicationState(
    token: string | null | undefined,
    opportunityId: string,
    state: Partial<UserApplicationState>
  ): Promise<UserApplicationState> {
    return fetchWithAuth<UserApplicationState>(`/api/applications/${opportunityId}`, token, {
      method: 'PUT',
      body: JSON.stringify(state),
    });
  },

  async updateStatus(
    token: string | null | undefined,
    opportunityId: string,
    status: ApplicationStatus
  ): Promise<UserApplicationState> {
    return fetchWithAuth<UserApplicationState>(`/api/applications/${opportunityId}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updatePriority(
    token: string | null | undefined,
    opportunityId: string,
    priority: PriorityLevel
  ): Promise<UserApplicationState> {
    return fetchWithAuth<UserApplicationState>(`/api/applications/${opportunityId}/priority`, token, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
  },

  // --- CONTACTS ---
  async getContacts(token: string | null | undefined): Promise<Contact[]> {
    if (!token) return [];
    return fetchWithAuth<Contact[]>('/api/contacts', token);
  },

  async createContact(token: string | null | undefined, contact: Partial<Contact>): Promise<Contact> {
    return fetchWithAuth<Contact>('/api/contacts', token, {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  },

  async updateContact(token: string | null | undefined, contactId: string, contact: Partial<Contact>): Promise<Contact> {
    return fetchWithAuth<Contact>(`/api/contacts/${contactId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(contact),
    });
  },

  async deleteContact(token: string | null | undefined, contactId: string): Promise<void> {
    await fetchWithAuth<void>(`/api/contacts/${contactId}`, token, {
      method: 'DELETE',
    });
  },
};
