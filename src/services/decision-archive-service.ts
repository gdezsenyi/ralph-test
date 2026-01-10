/**
 * Decision Archive Service
 * US-010: Create decision archive service
 *
 * This module provides a service to archive approved decisions to SharePoint.
 */

import {
  DecisionArchiveSchema,
  createDecisionArchiveEntry,
  SourceType
} from '../models/decision-archive';
import {
  DecisionSuggestion,
  DecisionSuggestionStatus,
  getFinalDecisionText
} from '../models/decision-suggestion';
import { AzureAdConfig } from './graph-api-client';

/**
 * Configuration for the Decision Archive Service
 */
export interface DecisionArchiveServiceConfig {
  /** Azure AD configuration for authentication */
  azureAdConfig: AzureAdConfig;
  /** SharePoint site URL */
  siteUrl: string;
  /** List name for the decision archive */
  listName: string;
}

/**
 * Result of an archive operation
 */
export interface ArchiveResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** The archived decision ID (if successful) */
  archivedDecisionId?: string;
  /** Error message (if failed) */
  error?: string;
  /** The full archived record (if successful) */
  archivedRecord?: DecisionArchiveSchema;
}

/**
 * Search parameters for querying archived decisions
 */
export interface DecisionSearchParams {
  /** Keyword to search in decision text */
  keyword?: string;
  /** Start date for date range filter */
  dateFrom?: Date;
  /** End date for date range filter */
  dateTo?: Date;
  /** Filter by meeting reference */
  meetingId?: string;
  /** Filter by approver */
  approver?: string;
  /** Filter by source type */
  sourceType?: SourceType;
  /** Maximum number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Decision Archive Service
 *
 * Archives approved decisions to SharePoint with full audit trail.
 */
export class DecisionArchiveService {
  // In-memory storage for MVP (would be SharePoint in production)
  private archivedDecisions: Map<string, DecisionArchiveSchema> = new Map();

  constructor(private readonly config: DecisionArchiveServiceConfig) {}

  /**
   * Archive an approved decision
   *
   * Includes full audit trail: original suggestion, modifications, approver.
   *
   * @param decision The approved decision suggestion
   * @param meetingReference Reference to the source meeting
   * @returns Archive result with the archived decision ID
   */
  async archiveDecision(
    decision: DecisionSuggestion,
    meetingReference: string
  ): Promise<ArchiveResult> {
    // Validate the decision is approved
    if (decision.status !== DecisionSuggestionStatus.Approved) {
      return {
        success: false,
        error: 'Cannot archive unapproved decision'
      };
    }

    // Validate we have an approver
    if (!decision.approvedBy) {
      return {
        success: false,
        error: 'Decision must have an approver before archiving'
      };
    }

    try {
      // Generate a unique decision ID
      const decisionId = this.generateDecisionId();

      // Determine source type from the source reference
      const sourceType: SourceType = decision.sourceReference.type;

      // Create the archive entry
      const archiveEntry = createDecisionArchiveEntry({
        DecisionId: decisionId,
        DecisionText: getFinalDecisionText(decision),
        MeetingReference: meetingReference,
        Approver: decision.approvedBy,
        ApprovalDate: decision.approvalTimestamp ?? new Date(),
        OriginalAISuggestion: decision.decisionText,
        ConfidenceScore: decision.confidenceScore,
        Status: 'active',
        SourceType: sourceType
      });

      // In production: Create item in SharePoint list
      // POST to SharePoint REST API or use Microsoft Graph

      // For MVP: Store in memory
      this.archivedDecisions.set(decisionId, archiveEntry);

      // Log for debugging
      console.log('DecisionArchiveService.archiveDecision: Archived decision:', decisionId);

      return {
        success: true,
        archivedDecisionId: decisionId,
        archivedRecord: archiveEntry
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to archive decision: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get an archived decision by ID
   */
  async getDecision(decisionId: string): Promise<DecisionArchiveSchema | null> {
    // In production: Query SharePoint list
    return this.archivedDecisions.get(decisionId) ?? null;
  }

  /**
   * Search archived decisions
   */
  async searchDecisions(params: DecisionSearchParams): Promise<{
    results: DecisionArchiveSchema[];
    totalCount: number;
  }> {
    let results = Array.from(this.archivedDecisions.values());

    // Apply filters
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      results = results.filter(
        (d) =>
          d.DecisionText.toLowerCase().includes(keyword) ||
          d.OriginalAISuggestion.toLowerCase().includes(keyword)
      );
    }

    if (params.dateFrom) {
      results = results.filter((d) => d.ApprovalDate >= params.dateFrom!);
    }

    if (params.dateTo) {
      results = results.filter((d) => d.ApprovalDate <= params.dateTo!);
    }

    if (params.meetingId) {
      results = results.filter((d) => d.MeetingReference.includes(params.meetingId!));
    }

    if (params.approver) {
      results = results.filter((d) => d.Approver === params.approver);
    }

    if (params.sourceType) {
      results = results.filter((d) => d.SourceType === params.sourceType);
    }

    // Get total count before pagination
    const totalCount = results.length;

    // Sort by approval date (most recent first)
    results.sort((a, b) => b.ApprovalDate.getTime() - a.ApprovalDate.getTime());

    // Apply pagination
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 50;
    results = results.slice(offset, offset + limit);

    return { results, totalCount };
  }

  /**
   * Update a decision's status (e.g., mark as superseded)
   */
  async updateDecisionStatus(
    decisionId: string,
    newStatus: 'active' | 'superseded' | 'archived'
  ): Promise<ArchiveResult> {
    const decision = this.archivedDecisions.get(decisionId);

    if (!decision) {
      return { success: false, error: 'Decision not found' };
    }

    decision.Status = newStatus;
    decision.ModifiedAt = new Date();

    return {
      success: true,
      archivedDecisionId: decisionId,
      archivedRecord: decision
    };
  }

  /**
   * Get decisions by meeting reference
   */
  async getDecisionsByMeeting(meetingReference: string): Promise<DecisionArchiveSchema[]> {
    return Array.from(this.archivedDecisions.values()).filter(
      (d) => d.MeetingReference === meetingReference
    );
  }

  /**
   * Get recent decisions
   */
  async getRecentDecisions(limit: number = 10): Promise<DecisionArchiveSchema[]> {
    const { results } = await this.searchDecisions({ limit });
    return results;
  }

  /**
   * Get count of archived decisions
   */
  async getDecisionCount(): Promise<number> {
    return this.archivedDecisions.size;
  }

  /**
   * Generate a unique decision ID
   */
  private generateDecisionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `DEC-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Export decisions for audit (returns all decisions in a format suitable for export)
   */
  async exportForAudit(params: DecisionSearchParams): Promise<{
    decisions: DecisionArchiveSchema[];
    exportedAt: Date;
    filters: DecisionSearchParams;
    totalCount: number;
  }> {
    const { results, totalCount } = await this.searchDecisions({
      ...params,
      limit: undefined, // No limit for export
      offset: undefined
    });

    return {
      decisions: results,
      exportedAt: new Date(),
      filters: params,
      totalCount
    };
  }
}
