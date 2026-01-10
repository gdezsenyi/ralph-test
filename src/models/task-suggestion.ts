/**
 * Task Suggestion Data Model
 * US-002: Create task suggestion data model
 *
 * This module defines the data model for AI-suggested tasks before Planner integration.
 */

/**
 * Status enum for task suggestions
 */
export enum TaskSuggestionStatus {
  /** Initial state - AI has suggested the task */
  Suggested = 'Suggested',
  /** Task has been approved by a human */
  Approved = 'Approved',
  /** Task has been rejected by a human */
  Rejected = 'Rejected',
  /** Task has been modified before approval */
  Modified = 'Modified'
}

/**
 * Reference to the source of the task suggestion
 */
export interface SourceReference {
  /** Type of source (meeting, email, chat) */
  type: 'meeting' | 'email' | 'chat';
  /** Unique identifier of the source */
  sourceId: string;
  /** Optional URL or path to the source */
  sourceUrl?: string;
  /** Timestamp reference within the source (e.g., meeting timestamp) */
  timestampRef?: string;
}

/**
 * Main interface for task suggestions
 */
export interface TaskSuggestion {
  /** Unique identifier for the task suggestion */
  id: string;

  /** Description of the task to be performed */
  description: string;

  /** AI-suggested assignee (user ID or email) */
  suggestedAssignee: string | null;

  /** AI-suggested due date */
  suggestedDueDate: Date | null;

  /** AI confidence score for this suggestion (0-100) */
  confidenceScore: number;

  /** Current status of the suggestion */
  status: TaskSuggestionStatus;

  /** Reference to the source of this suggestion */
  sourceReference: SourceReference;

  // Audit fields

  /** Timestamp when the suggestion was created */
  createdAt: Date;

  /** User ID of who approved the task (if approved) */
  approvedBy: string | null;

  /** Timestamp when the task was approved */
  approvalTimestamp: Date | null;

  /** Reason for rejection (if rejected) */
  rejectionReason: string | null;

  /** Modified description (if modified before approval) */
  modifiedDescription: string | null;

  /** Modified assignee (if changed from suggestion) */
  finalAssignee: string | null;

  /** Modified due date (if changed from suggestion) */
  finalDueDate: Date | null;
}

/**
 * Input parameters for creating a new task suggestion
 */
export interface CreateTaskSuggestionParams {
  description: string;
  suggestedAssignee?: string | null;
  suggestedDueDate?: Date | null;
  confidenceScore: number;
  sourceReference: SourceReference;
}

/**
 * Factory function to create a new task suggestion
 */
export function createTaskSuggestion(
  id: string,
  params: CreateTaskSuggestionParams
): TaskSuggestion {
  return {
    id,
    description: params.description,
    suggestedAssignee: params.suggestedAssignee ?? null,
    suggestedDueDate: params.suggestedDueDate ?? null,
    confidenceScore: params.confidenceScore,
    status: TaskSuggestionStatus.Suggested,
    sourceReference: params.sourceReference,
    createdAt: new Date(),
    approvedBy: null,
    approvalTimestamp: null,
    rejectionReason: null,
    modifiedDescription: null,
    finalAssignee: null,
    finalDueDate: null
  };
}

/**
 * Approve a task suggestion
 */
export function approveTaskSuggestion(
  task: TaskSuggestion,
  approvedBy: string,
  finalAssignee: string,
  finalDueDate?: Date | null
): TaskSuggestion {
  return {
    ...task,
    status: TaskSuggestionStatus.Approved,
    approvedBy,
    approvalTimestamp: new Date(),
    finalAssignee,
    finalDueDate: finalDueDate ?? task.suggestedDueDate
  };
}

/**
 * Reject a task suggestion
 */
export function rejectTaskSuggestion(
  task: TaskSuggestion,
  rejectedBy: string,
  rejectionReason: string
): TaskSuggestion {
  return {
    ...task,
    status: TaskSuggestionStatus.Rejected,
    approvedBy: rejectedBy, // Store who rejected it
    approvalTimestamp: new Date(),
    rejectionReason
  };
}

/**
 * Modify a task suggestion before approval
 */
export function modifyTaskSuggestion(
  task: TaskSuggestion,
  modifiedDescription: string,
  modifiedAssignee?: string,
  modifiedDueDate?: Date
): TaskSuggestion {
  return {
    ...task,
    status: TaskSuggestionStatus.Modified,
    modifiedDescription,
    finalAssignee: modifiedAssignee ?? task.suggestedAssignee,
    finalDueDate: modifiedDueDate ?? task.suggestedDueDate
  };
}

/**
 * Type guard to check if a task has been processed (approved or rejected)
 */
export function isTaskProcessed(task: TaskSuggestion): boolean {
  return (
    task.status === TaskSuggestionStatus.Approved ||
    task.status === TaskSuggestionStatus.Rejected
  );
}

/**
 * Type guard to check if a task is pending review
 */
export function isTaskPending(task: TaskSuggestion): boolean {
  return (
    task.status === TaskSuggestionStatus.Suggested ||
    task.status === TaskSuggestionStatus.Modified
  );
}
