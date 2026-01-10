/**
 * Approval Workflow Service
 * US-008: Create approval workflow service
 *
 * This module provides the core human-in-the-loop logic for managing approvals.
 */

import {
  DecisionSuggestion,
  approveDecisionSuggestion,
  rejectDecisionSuggestion,
  modifyDecisionSuggestion,
  approveModifiedDecisionSuggestion
} from '../models/decision-suggestion';
import {
  TaskSuggestion,
  approveTaskSuggestion,
  rejectTaskSuggestion,
  modifyTaskSuggestion
} from '../models/task-suggestion';
import { ApprovalQueue, ApprovalQueueItem, ApprovalStatus } from './approval-queue';

/**
 * Result of an approval operation
 */
export interface ApprovalResult {
  success: boolean;
  item: ApprovalQueueItem | null;
  error?: string;
}

/**
 * Parameters for approving a decision
 */
export interface ApproveDecisionParams {
  itemId: string;
  approvedBy: string;
  modifiedText?: string;
}

/**
 * Parameters for approving a task
 */
export interface ApproveTaskParams {
  itemId: string;
  approvedBy: string;
  finalAssignee: string;
  finalDueDate?: Date | null;
  modifiedDescription?: string;
}

/**
 * Parameters for rejecting any item
 */
export interface RejectParams {
  itemId: string;
  rejectedBy: string;
  rejectionReason: string;
}

/**
 * Parameters for modifying a decision
 */
export interface ModifyDecisionParams {
  itemId: string;
  modifiedText: string;
}

/**
 * Parameters for modifying a task
 */
export interface ModifyTaskParams {
  itemId: string;
  modifiedDescription: string;
  modifiedAssignee?: string;
  modifiedDueDate?: Date;
}

/**
 * Approval Workflow Service
 *
 * Manages the approval workflow for decisions and tasks, ensuring
 * proper human-in-the-loop control over all AI suggestions.
 */
export class ApprovalWorkflowService {
  constructor(private readonly queue: ApprovalQueue) {}

  /**
   * Submit a decision suggestion for approval
   */
  submitDecisionForApproval(
    decision: DecisionSuggestion,
    meetingId: string
  ): ApprovalQueueItem {
    return this.queue.addDecision(decision, meetingId);
  }

  /**
   * Submit a task suggestion for approval
   */
  submitTaskForApproval(
    task: TaskSuggestion,
    meetingId: string
  ): ApprovalQueueItem {
    return this.queue.addTask(task, meetingId);
  }

  /**
   * Submit multiple suggestions for approval
   */
  submitForApproval(
    decisions: DecisionSuggestion[],
    tasks: TaskSuggestion[],
    meetingId: string
  ): ApprovalQueueItem[] {
    const items: ApprovalQueueItem[] = [];

    for (const decision of decisions) {
      items.push(this.submitDecisionForApproval(decision, meetingId));
    }

    for (const task of tasks) {
      items.push(this.submitTaskForApproval(task, meetingId));
    }

    return items;
  }

  /**
   * Approve a decision
   *
   * Records approver identity and timestamp. Optionally accepts modified text.
   */
  approveDecision(params: ApproveDecisionParams): ApprovalResult {
    const item = this.queue.getItem(params.itemId);

    if (!item) {
      return { success: false, item: null, error: 'Item not found' };
    }

    if (item.type !== 'decision') {
      return { success: false, item: null, error: 'Item is not a decision' };
    }

    if (item.status !== 'Pending') {
      return { success: false, item: null, error: 'Item has already been processed' };
    }

    let decision = item.suggestion as DecisionSuggestion;

    // If text was modified, update it first
    if (params.modifiedText && params.modifiedText !== decision.decisionText) {
      decision = modifyDecisionSuggestion(decision, params.modifiedText);
      decision = approveModifiedDecisionSuggestion(decision, params.approvedBy);
    } else {
      decision = approveDecisionSuggestion(decision, params.approvedBy);
    }

    item.suggestion = decision;
    this.queue.updateStatus(params.itemId, 'Approved');

    return { success: true, item };
  }

  /**
   * Approve a task
   *
   * Records approver identity and timestamp. Requires final assignee.
   */
  approveTask(params: ApproveTaskParams): ApprovalResult {
    const item = this.queue.getItem(params.itemId);

    if (!item) {
      return { success: false, item: null, error: 'Item not found' };
    }

    if (item.type !== 'task') {
      return { success: false, item: null, error: 'Item is not a task' };
    }

    if (item.status !== 'Pending') {
      return { success: false, item: null, error: 'Item has already been processed' };
    }

    if (!params.finalAssignee) {
      return { success: false, item: null, error: 'Final assignee is required' };
    }

    let task = item.suggestion as TaskSuggestion;

    // If description was modified, apply modification first
    if (params.modifiedDescription && params.modifiedDescription !== task.description) {
      task = modifyTaskSuggestion(
        task,
        params.modifiedDescription,
        params.finalAssignee,
        params.finalDueDate ?? undefined
      );
    }

    // Apply approval
    task = approveTaskSuggestion(
      task,
      params.approvedBy,
      params.finalAssignee,
      params.finalDueDate
    );

    item.suggestion = task;
    this.queue.updateStatus(params.itemId, 'Approved');

    return { success: true, item };
  }

  /**
   * Reject a decision or task
   *
   * Requires a rejection reason to be provided.
   */
  reject(params: RejectParams): ApprovalResult {
    if (!params.rejectionReason || params.rejectionReason.trim().length === 0) {
      return { success: false, item: null, error: 'Rejection reason is required' };
    }

    const item = this.queue.getItem(params.itemId);

    if (!item) {
      return { success: false, item: null, error: 'Item not found' };
    }

    if (item.status !== 'Pending') {
      return { success: false, item: null, error: 'Item has already been processed' };
    }

    if (item.type === 'decision') {
      const decision = rejectDecisionSuggestion(
        item.suggestion as DecisionSuggestion,
        params.rejectedBy,
        params.rejectionReason
      );
      item.suggestion = decision;
    } else {
      const task = rejectTaskSuggestion(
        item.suggestion as TaskSuggestion,
        params.rejectedBy,
        params.rejectionReason
      );
      item.suggestion = task;
    }

    this.queue.updateStatus(params.itemId, 'Rejected');

    return { success: true, item };
  }

  /**
   * Modify a decision text (without approving yet)
   *
   * Stores both original and modified text for audit trail.
   */
  modifyDecision(params: ModifyDecisionParams): ApprovalResult {
    const item = this.queue.getItem(params.itemId);

    if (!item) {
      return { success: false, item: null, error: 'Item not found' };
    }

    if (item.type !== 'decision') {
      return { success: false, item: null, error: 'Item is not a decision' };
    }

    if (item.status !== 'Pending') {
      return { success: false, item: null, error: 'Item has already been processed' };
    }

    const decision = modifyDecisionSuggestion(
      item.suggestion as DecisionSuggestion,
      params.modifiedText
    );

    item.suggestion = decision;
    item.updatedAt = new Date();

    return { success: true, item };
  }

  /**
   * Modify a task (without approving yet)
   *
   * Stores both original and modified values for audit trail.
   */
  modifyTask(params: ModifyTaskParams): ApprovalResult {
    const item = this.queue.getItem(params.itemId);

    if (!item) {
      return { success: false, item: null, error: 'Item not found' };
    }

    if (item.type !== 'task') {
      return { success: false, item: null, error: 'Item is not a task' };
    }

    if (item.status !== 'Pending') {
      return { success: false, item: null, error: 'Item has already been processed' };
    }

    const task = modifyTaskSuggestion(
      item.suggestion as TaskSuggestion,
      params.modifiedDescription,
      params.modifiedAssignee,
      params.modifiedDueDate
    );

    item.suggestion = task;
    item.updatedAt = new Date();

    return { success: true, item };
  }

  /**
   * Get pending items for a meeting
   */
  getPendingItemsForMeeting(meetingId: string): ApprovalQueueItem[] {
    return this.queue.getItems({ meetingId, status: 'Pending' });
  }

  /**
   * Get all pending items
   */
  getAllPendingItems(): ApprovalQueueItem[] {
    return this.queue.getPendingItems();
  }

  /**
   * Batch approve multiple items
   */
  batchApprove(
    itemIds: string[],
    approvedBy: string,
    taskAssigneeMap: Map<string, string>
  ): ApprovalResult[] {
    const results: ApprovalResult[] = [];

    for (const itemId of itemIds) {
      const item = this.queue.getItem(itemId);

      if (!item) {
        results.push({ success: false, item: null, error: `Item ${itemId} not found` });
        continue;
      }

      if (item.type === 'decision') {
        results.push(this.approveDecision({ itemId, approvedBy }));
      } else {
        const assignee = taskAssigneeMap.get(itemId);
        if (!assignee) {
          results.push({
            success: false,
            item: null,
            error: `No assignee provided for task ${itemId}`
          });
          continue;
        }
        results.push(
          this.approveTask({ itemId, approvedBy, finalAssignee: assignee })
        );
      }
    }

    return results;
  }
}
