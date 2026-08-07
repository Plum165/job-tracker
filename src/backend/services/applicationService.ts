import { applicationRepository } from '../repository/applicationRepository';
import { UserApplicationState, ApplicationStatus, PriorityLevel } from '../../types';

export class ApplicationService {
  async getUserApplications(userId: string): Promise<Record<string, UserApplicationState>> {
    return applicationRepository.getUserApplications(userId);
  }

  async getOpportunityState(userId: string, opportunityId: string): Promise<UserApplicationState> {
    return applicationRepository.getOpportunityState(userId, opportunityId);
  }

  async saveApplicationState(userId: string, opportunityId: string, stateData: Partial<UserApplicationState>): Promise<UserApplicationState> {
    const currentState = await applicationRepository.getOpportunityState(userId, opportunityId);
    const updatedState: UserApplicationState = {
      ...currentState,
      ...stateData,
      opportunityId,
    };

    return applicationRepository.saveApplicationState(userId, updatedState);
  }

  async updateStatus(userId: string, opportunityId: string, status: ApplicationStatus): Promise<UserApplicationState> {
    return applicationRepository.updateStatus(userId, opportunityId, status);
  }

  async updatePriority(userId: string, opportunityId: string, priority: PriorityLevel): Promise<UserApplicationState> {
    return applicationRepository.updatePriority(userId, opportunityId, priority);
  }
}

export const applicationService = new ApplicationService();
