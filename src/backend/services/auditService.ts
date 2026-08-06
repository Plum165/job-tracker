import { UserAuditLog } from '../types/user';

class AuditService {
  private auditLogs: UserAuditLog[] = [];

  logAction(
    userId: string,
    action: UserAuditLog['action'],
    performedBy: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): UserAuditLog {
    const entry: UserAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      action,
      performedBy,
      ipAddress,
      userAgent,
      details,
      timestamp: new Date().toISOString(),
    };

    this.auditLogs.unshift(entry);
    // Keep max 500 logs in memory
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }

    console.log(`[AUDIT LOG] Action: ${action} | User: ${userId} | PerformedBy: ${performedBy} | Time: ${entry.timestamp}`);
    return entry;
  }

  getUserAuditLogs(userId: string): UserAuditLog[] {
    return this.auditLogs.filter((log) => log.userId === userId);
  }

  getAllAuditLogs(): UserAuditLog[] {
    return [...this.auditLogs];
  }
}

export const auditService = new AuditService();
