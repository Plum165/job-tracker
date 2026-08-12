import { prisma } from '../lib/prisma';
import { ApplicationStatus, UserApplicationState } from '../../types';
import { DEFAULT_INITIAL_PRIVATE_STATES, DEFAULT_SHARED_OPPORTUNITIES } from '../../data/defaultCatalog';
import { createDefaultApplicationState } from '../../lib/storage';
import { jobRepository } from './jobRepository';

class ApplicationRepository {
  // Key format: `${userId}:${opportunityId}`
  private fallbackStates: Map<string, UserApplicationState> = new Map();

  /**
   * Get all application states for a given user
   */
  async getUserApplications(userId: string): Promise<Record<string, UserApplicationState>> {
    const result: Record<string, UserApplicationState> = {};

    try {
      const dbStates = await prisma.userApplicationState.findMany({
        where: { userId },
      });

      if (dbStates.length > 0) {
        dbStates.forEach((s) => {
          const mapped = this.mapPrismaState(s);
          result[mapped.opportunityId] = mapped;
        });
        return result;
      }
    } catch (err) {
      // Fallback
    }

    // Populate default fallback state for demo catalog if not set
    this.fallbackStates.forEach((val, key) => {
      if (key.startsWith(`${userId}:`)) {
        const oppId = key.split(':')[1];
        result[oppId] = val;
      }
    });

    return result;
  }

  /**
   * Get application state for a specific opportunity and user
   */
  async getOpportunityState(userId: string, opportunityId: string): Promise<UserApplicationState> {
    const fallbackKey = `${userId}:${opportunityId}`;

    try {
      const dbState = await prisma.userApplicationState.findUnique({
        where: {
          userId_opportunityId: { userId, opportunityId },
        },
      });

      if (dbState) {
        return this.mapPrismaState(dbState);
      }
    } catch (err) {
      // Fallback
    }

    if (this.fallbackStates.has(fallbackKey)) {
      return this.fallbackStates.get(fallbackKey)!;
    }

    // Default initial seed state if available
    const defaultState = createDefaultApplicationState(opportunityId);
    if (DEFAULT_INITIAL_PRIVATE_STATES[opportunityId]) {
      return {
        ...defaultState,
        ...DEFAULT_INITIAL_PRIVATE_STATES[opportunityId],
      };
    }

    return defaultState;
  }

  /**
   * Save / Upsert application state for a user and opportunity
   * Lazily seeds default opportunities if they don't exist
   */
  async saveApplicationState(userId: string, state: UserApplicationState): Promise<UserApplicationState> {
    const fallbackKey = `${userId}:${state.opportunityId}`;
    const updatedState: UserApplicationState = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };

    this.fallbackStates.set(fallbackKey, updatedState);

    try {
      // Pre-check: ensure the opportunity exists in the database
      // This prevents foreign key constraint violations
      let opportunityExists = false;
      try {
        const existing = await prisma.jobOpportunity.findUnique({
          where: { id: state.opportunityId },
          select: { id: true },
        });
        opportunityExists = !!existing;
      } catch (err) {
        // If query fails, assume it doesn't exist
        opportunityExists = false;
      }

      // If opportunity doesn't exist, try to create it from default catalog
      if (!opportunityExists) {
        const defaultOpp = DEFAULT_SHARED_OPPORTUNITIES.find(
          (opp) => opp.id === state.opportunityId
        );

        if (defaultOpp) {
          // Lazy-seed the default opportunity into the database
          try {
            await jobRepository.createJob({
              ...defaultOpp,
              createdById: null, // Shared opportunities have no creator
            });
            opportunityExists = true;
          } catch (err) {
            // If creation fails, continue - the upsert will fail with better error message
            console.warn(
              `Warning: Could not seed default opportunity ${state.opportunityId}:`,
              err
            );
          }
        }
      }

      // Now attempt the upsert
      const dbState = await prisma.userApplicationState.upsert({
        where: {
          userId_opportunityId: { userId, opportunityId: state.opportunityId },
        },
        create: {
          userId,
          opportunityId: state.opportunityId,
          status: state.status,
          priority: state.priority,
          dateApplied: state.dateApplied || null,
          personalNotes: state.personalNotes || '',
          followUpDate: state.followUpDate || null,
          interviewDates: JSON.stringify(state.interviewDates || []),
          documentsPrepared: JSON.stringify(state.documentsPrepared || {}),
          personalLinks: JSON.stringify(state.personalLinks || []),
        },
        update: {
          status: state.status,
          priority: state.priority,
          dateApplied: state.dateApplied || null,
          personalNotes: state.personalNotes || '',
          followUpDate: state.followUpDate || null,
          interviewDates: JSON.stringify(state.interviewDates || []),
          documentsPrepared: JSON.stringify(state.documentsPrepared || {}),
          personalLinks: JSON.stringify(state.personalLinks || []),
        },
      });

      return this.mapPrismaState(dbState);
    } catch (err) {
      // Foreign key or other constraint violations fall back to in-memory state
      console.warn(
        `Warning: Could not persist application state to database, using in-memory cache:`,
        err
      );
      return updatedState;
    }
  }

  /**
   * Update status specifically for a user & opportunity
   */
  async updateStatus(userId: string, opportunityId: string, status: ApplicationStatus): Promise<UserApplicationState> {
    const current = await this.getOpportunityState(userId, opportunityId);
    const updated: UserApplicationState = {
      ...current,
      status,
      dateApplied:
        status === ApplicationStatus.APPLIED && !current.dateApplied
          ? new Date().toISOString().split('T')[0]
          : current.dateApplied,
    };

    return this.saveApplicationState(userId, updated);
  }

  /**
   * Update priority specifically for a user & opportunity
   */
  async updatePriority(userId: string, opportunityId: string, priority: any): Promise<UserApplicationState> {
    const current = await this.getOpportunityState(userId, opportunityId);
    const updated: UserApplicationState = {
      ...current,
      priority,
    };

    return this.saveApplicationState(userId, updated);
  }

  private mapPrismaState(s: any): UserApplicationState {
    let parsedInterviews = [];
    let parsedDocs = {
      cvReady: false,
      coverLetterReady: false,
      portfolioIncluded: false,
      transcriptIncluded: false,
      assessmentComplete: false,
    };
    let parsedLinks = [];

    try {
      parsedInterviews = typeof s.interviewDates === 'string' ? JSON.parse(s.interviewDates) : s.interviewDates || [];
    } catch (e) {}

    try {
      parsedDocs = typeof s.documentsPrepared === 'string' ? JSON.parse(s.documentsPrepared) : s.documentsPrepared || parsedDocs;
    } catch (e) {}

    try {
      parsedLinks = typeof s.personalLinks === 'string' ? JSON.parse(s.personalLinks) : s.personalLinks || [];
    } catch (e) {}

    return {
      opportunityId: s.opportunityId,
      status: s.status as any,
      priority: s.priority as any,
      dateApplied: s.dateApplied || undefined,
      personalNotes: s.personalNotes || '',
      followUpDate: s.followUpDate || undefined,
      interviewDates: parsedInterviews,
      documentsPrepared: parsedDocs,
      personalLinks: parsedLinks,
      lastUpdated: s.lastUpdated instanceof Date ? s.lastUpdated.toISOString() : String(s.lastUpdated),
    };
  }
}

export const applicationRepository = new ApplicationRepository();
