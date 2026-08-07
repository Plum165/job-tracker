import { jobRepository } from '../repository/jobRepository';
import { JobOpportunity } from '../../types';
import { AppError } from '../middleware/errorHandler';

export class JobService {
  async getVisibleJobs(userId: string): Promise<JobOpportunity[]> {
    return jobRepository.getVisibleJobs(userId);
  }

  async getPublicJobs(): Promise<JobOpportunity[]> {
    return jobRepository.getPublicJobs();
  }

  async getUserPrivateJobs(userId: string): Promise<JobOpportunity[]> {
    return jobRepository.getUserPrivateJobs(userId);
  }

  async createJob(userId: string, data: any): Promise<JobOpportunity> {
    return jobRepository.createJob({
      ...data,
      createdById: userId,
    });
  }

  async updateJob(userId: string, jobId: string, data: any): Promise<JobOpportunity> {
    const existing = await jobRepository.findById(jobId);
    if (!existing) {
      throw new AppError(`Job opportunity with ID '${jobId}' not found`, 404);
    }

    // Check ownership if not shared
    if (!existing.isShared && (existing as any).createdById && (existing as any).createdById !== userId) {
      throw new AppError('Unauthorized to modify this job opportunity', 403);
    }

    return jobRepository.updateJob(jobId, data);
  }

  async deleteJob(userId: string, jobId: string): Promise<void> {
    const existing = await jobRepository.findById(jobId);
    if (!existing) {
      throw new AppError(`Job opportunity with ID '${jobId}' not found`, 404);
    }

    if (!existing.isShared && (existing as any).createdById && (existing as any).createdById !== userId) {
      throw new AppError('Unauthorized to delete this job opportunity', 403);
    }

    await jobRepository.deleteJob(jobId);
  }
}

export const jobService = new JobService();
