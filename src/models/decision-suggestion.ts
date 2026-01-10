/**
 * Decision Suggestion Data Model
 * US-003: Create decision suggestion data model
 *
 * This module defines the data model for AI-suggested decisions.
 */

import { SourceReference } from './task-suggestion';

/**
 * Status enum for decision suggestions
 */
export enum DecisionSuggestionStatus {
  /** Initial state - AI has suggested the decision */
  Suggested = 'Suggested',
  /** Decision has been approved by a human */
  Approved = 'Approved',
  /** Decision has been rejected by a human */
  Rejected = 'Rejected',
  /** Decision has been modified before approval */
  Modified = 'Modified'
}

/**
 * Main interface for decision suggestions
 */
export interface DecisionSuggestion {
  /** Unique identifier for the decision suggestion */
  id: string;

  /** The text of the suggested decision */
  decisionText: string;

  /** Context around the decision (what led to it) */
  context: string;

  /** Excerpt from the transcript where the decision was identified */
  transcriptExcerpt: string;

  /** AI confidence score for this suggestion (0-100) */
  confidenceScore: number;

  /** Current status of the suggestion */
  status: DecisionSuggestionStatus;

  /** Reference to the source of this suggestion */
  sourceReference: SourceReference;

  // Audit fields

  /** Timestamp when the suggestion was created */
  createdAt: Date;

  /** Modified text (if changed before approval) */
  modifiedText: string | null;

  /** User ID of who approved the decision (if approved) */
  approvedBy: string | null;

  /** Timestamp when the decision was approved */
  approvalTimestamp: Date | null;

  /** Reason for rejection (if rejected) */
  rejectionReason: string | null;
}

/**
 * Input parameters for creating a new decision suggestion
 */
export interface CreateDecisionSuggestionParams {
  decisionText: string;
  context: string;
  transcriptExcerpt: string;
  confidenceScore: number;
  sourceReference: SourceReference;
}

/**
 * Factory function to create a new decision suggestion
 */
export function createDecisionSuggestion(
  id: string,
  params: CreateDecisionSuggestionParams
): DecisionSuggestion {
  return {
    id,
    decisionText: params.decisionText,
    context: params.context,
    transcriptExcerpt: params.transcriptExcerpt,
    confidenceScore: params.confidenceScore,
    status: DecisionSuggestionStatus.Suggested,
    sourceReference: params.sourceReference,
    createdAt: new Date(),
    modifiedText: null,
    approvedBy: null,
    approvalTimestamp: null,
    rejectionReason: null
  };
}

/**
 * Approve a decision suggestion
 */
export function approveDecisionSuggestion(
  decision: DecisionSuggestion,
  approvedBy: string
): DecisionSuggestion {
  return {
    ...decision,
    status: DecisionSuggestionStatus.Approved,
    approvedBy,
    approvalTimestamp: new Date()
  };
}

/**
 * Reject a decision suggestion
 */
export function rejectDecisionSuggestion(
  decision: DecisionSuggestion,
  rejectedBy: string,
  rejectionReason: string
): DecisionSuggestion {
  return {
    ...decision,
    status: DecisionSuggestionStatus.Rejected,
    approvedBy: rejectedBy, // Store who rejected it
    approvalTimestamp: new Date(),
    rejectionReason
  };
}

/**
 * Modify a decision suggestion text before approval
 */
export function modifyDecisionSuggestion(
  decision: DecisionSuggestion,
  modifiedText: string
): DecisionSuggestion {
  return {
    ...decision,
    status: DecisionSuggestionStatus.Modified,
    modifiedText
  };
}

/**
 * Approve a modified decision suggestion
 */
export function approveModifiedDecisionSuggestion(
  decision: DecisionSuggestion,
  approvedBy: string,
  finalText?: string
): DecisionSuggestion {
  return {
    ...decision,
    status: DecisionSuggestionStatus.Approved,
    modifiedText: finalText ?? decision.modifiedText,
    approvedBy,
    approvalTimestamp: new Date()
  };
}

/**
 * Get the final decision text (modified or original)
 */
export function getFinalDecisionText(decision: DecisionSuggestion): string {
  return decision.modifiedText ?? decision.decisionText;
}

/**
 * Type guard to check if a decision has been processed (approved or rejected)
 */
export function isDecisionProcessed(decision: DecisionSuggestion): boolean {
  return (
    decision.status === DecisionSuggestionStatus.Approved ||
    decision.status === DecisionSuggestionStatus.Rejected
  );
}

/**
 * Type guard to check if a decision is pending review
 */
export function isDecisionPending(decision: DecisionSuggestion): boolean {
  return (
    decision.status === DecisionSuggestionStatus.Suggested ||
    decision.status === DecisionSuggestionStatus.Modified
  );
}

/**
 * Confidence level classification
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * Get the confidence level based on score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
