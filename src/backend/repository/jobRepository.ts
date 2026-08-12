import { prisma } from '../lib/prisma';
import { JobOpportunity } from '../../types';
import { DEFAULT_SHARED_OPPORTUNITIES } from '../../data/defaultCatalog';

class JobRepository {
  private fallbackJobs: Map<string, JobOpportunity> = new Map();

  constructor() {
    // Populate fallback map with default shared opportunities
    DEFAULT_SHARED_OPPORTUNITIES.forEach((opp) => {
      this.fallbackJobs.set(opp.id, opp);
    });

    // Asynchronously seed default opportunities into database on startup
    this.seedDefaultOpportunities();
  }

  /**
   * Seed default shared opportunities into PostgreSQL on startup
   * This prevents foreign key constraint violations when users access these opportunities
   */
  private async seedDefaultOpportunities(): Promise<void> {
    try {
      for (const opp of DEFAULT_SHARED_OPPORTUNITIES) {
        await prisma.jobOpportunity.upsert({
          where: { id: opp.id },
          update: {
            companyName: opp.companyName,
            companyLogo: opp.companyLogo || null,
            jobTitle: opp.jobTitle,
            jobCategory: opp.jobCategory,
            companyDescription: opp.companyDescription || '',
            companyWebsite: opp.companyWebsite || '',
            applicationLink: opp.applicationLink || '',
            location: opp.location,
            workArrangement: opp.workArrangement,
            employmentType: opp.employmentType,
            openingDate: opp.openingDate || null,
            closingDate: opp.closingDate,
            generalNotes: opp.generalNotes || null,
            tags: JSON.stringify(opp.tags),
            isShared: opp.isShared,
            createdById: null, // Shared opportunities have no creator
          },
          create: {
            id: opp.id,
            companyName: opp.companyName,
            companyLogo: opp.companyLogo || null,
            jobTitle: opp.jobTitle,
            jobCategory: opp.jobCategory,
            companyDescription: opp.companyDescription || '',
            companyWebsite: opp.companyWebsite || '',
            applicationLink: opp.applicationLink || '',
            location: opp.location,
            workArrangement: opp.workArrangement,
            employmentType: opp.employmentType,
            dateAdded: new Date(opp.dateAdded),
            openingDate: opp.openingDate || null,
            closingDate: opp.closingDate,
            generalNotes: opp.generalNotes || null,
            tags: JSON.stringify(opp.tags),
            isShared: opp.isShared,
            createdById: null,
          },
        });
      }
    } catch (err) {
      console.warn(
        'Warning: Could not seed default opportunities to database on startup. Using in-memory fallback.',
        err
      );
    }
  }

  /**
   * Find job by ID
   */
  async findById(jobId: string): Promise<JobOpportunity | null> {
    try {
      const dbJob = await prisma.jobOpportunity.findUnique({
        where: { id: jobId },
      });
      if (dbJob) {
        return this.mapPrismaJob(dbJob);
      }
    } catch (err) {
      // Fallback
    }
    return this.fallbackJobs.get(jobId) || null;
  }

  /**
   * Get all visible jobs (Public Catalog + User Created)
   */
  async getVisibleJobs(userId: string): Promise<JobOpportunity[]> {
    const list: JobOpportunity[] = [];
    try {
      const dbJobs = await prisma.jobOpportunity.findMany({
        where: {
          OR: [{ isShared: true }, { createdById: userId }],
        },
        orderBy: { dateAdded: 'desc' },
      });
      if (dbJobs.length > 0) {
        return dbJobs.map((j: any) => this.mapPrismaJob(j));
      }
    } catch (err) {
      // Fallback to in-memory map
    }

    // Merge fallback default shared jobs with any user created fallback jobs
    this.fallbackJobs.forEach((j) => {
      if (j.isShared || (j as any).createdById === userId) {
        list.push(j);
      }
    });

    return list;
  }

  /**
   * Get public shared jobs catalog only
   */
  async getPublicJobs(): Promise<JobOpportunity[]> {
    try {
      const dbJobs = await prisma.jobOpportunity.findMany({
        where: { isShared: true },
        orderBy: { dateAdded: 'desc' },
      });
      if (dbJobs.length > 0) {
        return dbJobs.map((j: any) => this.mapPrismaJob(j));
      }
    } catch (err) {
      // Fallback
    }

    const publicList: JobOpportunity[] = [];
    this.fallbackJobs.forEach((j) => {
      if (j.isShared) publicList.push(j);
    });
    return publicList;
  }

  /**
   * Get jobs created specifically by user
   */
  async getUserPrivateJobs(userId: string): Promise<JobOpportunity[]> {
    try {
      const dbJobs = await prisma.jobOpportunity.findMany({
        where: { createdById: userId, isShared: false },
        orderBy: { dateAdded: 'desc' },
      });
      if (dbJobs.length > 0) {
        return dbJobs.map((j: any) => this.mapPrismaJob(j));
      }
    } catch (err) {
      // Fallback
    }

    const privateList: JobOpportunity[] = [];
    this.fallbackJobs.forEach((j) => {
      if (!j.isShared && (j as any).createdById === userId) {
        privateList.push(j);
      }
    });
    return privateList;
  }

  /**
   * Create new job opportunity
   */
  async createJob(data: Omit<JobOpportunity, 'id'> & { id?: string; createdById?: string }): Promise<JobOpportunity> {
    const jobId = data.id || `opp-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newJob: JobOpportunity = {
      ...data,
      id: jobId,
      dateAdded: data.dateAdded || new Date().toISOString().split('T')[0],
      tags: data.tags || [],
      isShared: data.isShared !== undefined ? data.isShared : false,
    };
    (newJob as any).createdById = data.createdById;

    this.fallbackJobs.set(jobId, newJob);

    try {
      const created = await prisma.jobOpportunity.create({
        data: {
          id: jobId,
          companyName: newJob.companyName,
          companyLogo: newJob.companyLogo || null,
          jobTitle: newJob.jobTitle,
          jobCategory: newJob.jobCategory,
          companyDescription: newJob.companyDescription || '',
          companyWebsite: newJob.companyWebsite || '',
          applicationLink: newJob.applicationLink || '',
          location: newJob.location,
          workArrangement: newJob.workArrangement,
          employmentType: newJob.employmentType,
          dateAdded: new Date(newJob.dateAdded),
          openingDate: newJob.openingDate || null,
          closingDate: newJob.closingDate,
          generalNotes: newJob.generalNotes || null,
          tags: JSON.stringify(newJob.tags),
          isShared: newJob.isShared,
          createdById: data.createdById || null,
        },
      });
      return this.mapPrismaJob(created);
    } catch (err) {
      return newJob;
    }
  }

  /**
   * Update existing job opportunity
   */
  async updateJob(jobId: string, data: Partial<JobOpportunity>): Promise<JobOpportunity> {
    const existing = await this.findById(jobId);
    if (!existing) {
      throw new Error(`Job opportunity '${jobId}' not found`);
    }

    const updatedJob: JobOpportunity = {
      ...existing,
      ...data,
    };

    this.fallbackJobs.set(jobId, updatedJob);

    try {
      const dbUpdated = await prisma.jobOpportunity.update({
        where: { id: jobId },
        data: {
          companyName: data.companyName,
          companyLogo: data.companyLogo,
          jobTitle: data.jobTitle,
          jobCategory: data.jobCategory,
          companyDescription: data.companyDescription,
          companyWebsite: data.companyWebsite,
          applicationLink: data.applicationLink,
          location: data.location,
          workArrangement: data.workArrangement,
          employmentType: data.employmentType,
          closingDate: data.closingDate,
          generalNotes: data.generalNotes,
          tags: data.tags ? JSON.stringify(data.tags) : undefined,
          isShared: data.isShared,
        },
      });
      return this.mapPrismaJob(dbUpdated);
    } catch (err) {
      return updatedJob;
    }
  }

  /**
   * Delete job opportunity
   */
  async deleteJob(jobId: string): Promise<boolean> {
    this.fallbackJobs.delete(jobId);
    try {
      await prisma.jobOpportunity.delete({
        where: { id: jobId },
      });
    } catch (err) {
      // Ignore
    }
    return true;
  }

  private mapPrismaJob(u: any): JobOpportunity {
    let parsedTags: string[] = [];
    try {
      parsedTags = typeof u.tags === 'string' ? JSON.parse(u.tags) : u.tags || [];
    } catch (e) {
      parsedTags = [];
    }

    return {
      id: u.id,
      companyName: u.companyName,
      companyLogo: u.companyLogo || undefined,
      jobTitle: u.jobTitle,
      jobCategory: u.jobCategory as any,
      companyDescription: u.companyDescription,
      companyWebsite: u.companyWebsite,
      applicationLink: u.applicationLink,
      location: u.location,
      workArrangement: u.workArrangement as any,
      employmentType: u.employmentType as any,
      dateAdded: u.dateAdded instanceof Date ? u.dateAdded.toISOString().split('T')[0] : String(u.dateAdded),
      openingDate: u.openingDate || undefined,
      closingDate: u.closingDate,
      generalNotes: u.generalNotes || undefined,
      tags: parsedTags,
      isShared: u.isShared,
      createdById: u.createdById || undefined,
    };
  }
}

export const jobRepository = new JobRepository();
