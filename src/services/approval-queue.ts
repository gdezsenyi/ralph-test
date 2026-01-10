/**
 * Approval Queue Data Store
 * US-007: Create approval queue data store
 *
 * This module provides an in-memory data store for pending approval items.
 * For MVP - to be replaced with persistent storage later.
 */

import { DecisionSuggestion, DecisionSuggestionStatus } from '../models/decision-suggestion';
import { TaskSuggestion, TaskSuggestionStatus } from '../models/task-suggestion';

/**
 * Types of items that can be in the approval queue
 */
export type ApprovalItemType = 'decision' | 'task';

/**
 * Approval status for queue items
 */
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

/**
 * Wrapper for items in the approval queue
 */
export interface ApprovalQueueItem {
  /** Unique identifier for this queue item */
  id: string;
  /** Type of item (decision or task) */
  type: ApprovalItemType;
  /** The actual suggestion data */
  suggestion: DecisionSuggestion | TaskSuggestion;
  /** Meeting ID this suggestion belongs to */
  meetingId: string;
  /** Current approval status */
  status: ApprovalStatus;
  /** Timestamp when added to queue */
  addedAt: Date;
  /** Timestamp of last status update */
  updatedAt: Date;
  /** Whether this item has been escalated */
  escalated: boolean;
  /** Timestamp when escalated (if applicable) */
  escalatedAt: Date | null;
}

/**
 * Filter options for querying the approval queue
 */
export interface ApprovalQueueFilter {
  status?: ApprovalStatus;
  type?: ApprovalItemType;
  meetingId?: string;
  escalated?: boolean;
  addedBefore?: Date;
  addedAfter?: Date;
}

/**
 * Approval Queue - In-Memory Implementation
 *
 * Stores pending approval items with support for filtering and status tracking.
 */
export class ApprovalQueue {
  private items: Map<string, ApprovalQueueItem> = new Map();

  /**
   * Add a decision suggestion to the queue
   */
  addDecision(suggestion: DecisionSuggestion, meetingId: string): ApprovalQueueItem {
    const item: ApprovalQueueItem = {
      id: suggestion.id,
      type: 'decision',
      suggestion,
      meetingId,
      status: 'Pending',
      addedAt: new Date(),
      updatedAt: new Date(),
      escalated: false,
      escalatedAt: null
    };

    this.items.set(item.id, item);
    return item;
  }

  /**
   * Add a task suggestion to the queue
   */
  addTask(suggestion: TaskSuggestion, meetingId: string): ApprovalQueueItem {
    const item: ApprovalQueueItem = {
      id: suggestion.id,
      type: 'task',
      suggestion,
      meetingId,
      status: 'Pending',
      addedAt: new Date(),
      updatedAt: new Date(),
      escalated: false,
      escalatedAt: null
    };

    this.items.set(item.id, item);
    return item;
  }

  /**
   * Add any suggestion item to the queue
   */
  addItem(
    suggestion: DecisionSuggestion | TaskSuggestion,
    type: ApprovalItemType,
    meetingId: string
  ): ApprovalQueueItem {
    if (type === 'decision') {
      return this.addDecision(suggestion as DecisionSuggestion, meetingId);
    }
    return this.addTask(suggestion as TaskSuggestion, meetingId);
  }

  /**
   * Get an item by ID
   */
  getItem(itemId: string): ApprovalQueueItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Get all items for a specific meeting
   */
  getItemsByMeeting(meetingId: string): ApprovalQueueItem[] {
    return Array.from(this.items.values()).filter(
      (item) => item.meetingId === meetingId
    );
  }

  /**
   * Get all items matching the filter criteria
   */
  getItems(filter?: ApprovalQueueFilter): ApprovalQueueItem[] {
    let results = Array.from(this.items.values());

    if (filter) {
      if (filter.status !== undefined) {
        results = results.filter((item) => item.status === filter.status);
      }
      if (filter.type !== undefined) {
        results = results.filter((item) => item.type === filter.type);
      }
      if (filter.meetingId !== undefined) {
        results = results.filter((item) => item.meetingId === filter.meetingId);
      }
      if (filter.escalated !== undefined) {
        results = results.filter((item) => item.escalated === filter.escalated);
      }
      if (filter.addedBefore !== undefined) {
        results = results.filter((item) => item.addedAt < filter.addedBefore!);
      }
      if (filter.addedAfter !== undefined) {
        results = results.filter((item) => item.addedAt > filter.addedAfter!);
      }
    }

    return results;
  }

  /**
   * Get all pending items (shorthand)
   */
  getPendingItems(): ApprovalQueueItem[] {
    return this.getItems({ status: 'Pending' });
  }

  /**
   * Get pending items by type
   */
  getPendingDecisions(): ApprovalQueueItem[] {
    return this.getItems({ status: 'Pending', type: 'decision' });
  }

  getPendingTasks(): ApprovalQueueItem[] {
    return this.getItems({ status: 'Pending', type: 'task' });
  }

  /**
   * Update the status of an item
   */
  updateStatus(itemId: string, status: ApprovalStatus): ApprovalQueueItem | undefined {
    const item = this.items.get(itemId);
    if (!item) {
      return undefined;
    }

    item.status = status;
    item.updatedAt = new Date();

    // Also update the underlying suggestion status
    if (item.type === 'decision') {
      const decision = item.suggestion as DecisionSuggestion;
      decision.status = this.mapToDecisionStatus(status);
    } else {
      const task = item.suggestion as TaskSuggestion;
      task.status = this.mapToTaskStatus(status);
    }

    return item;
  }

  /**
   * Mark an item as escalated
   */
  markEscalated(itemId: string): ApprovalQueueItem | undefined {
    const item = this.items.get(itemId);
    if (!item) {
      return undefined;
    }

    item.escalated = true;
    item.escalatedAt = new Date();
    item.updatedAt = new Date();

    return item;
  }

  /**
   * Remove an item from the queue
   */
  removeItem(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  /**
   * Get count of items by status
   */
  getCountByStatus(): Record<ApprovalStatus, number> {
    const counts: Record<ApprovalStatus, number> = {
      Pending: 0,
      Approved: 0,
      Rejected: 0
    };

    for (const item of this.items.values()) {
      counts[item.status]++;
    }

    return counts;
  }

  /**
   * Get items that need escalation (pending for more than specified hours)
   */
  getItemsNeedingEscalation(hoursThreshold: number = 72): ApprovalQueueItem[] {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    return this.getItems({
      status: 'Pending',
      escalated: false,
      addedBefore: threshold
    });
  }

  /**
   * Clear all items (for testing)
   */
  clear(): void {
    this.items.clear();
  }

  /**
   * Get total item count
   */
  get size(): number {
    return this.items.size;
  }

  /**
   * Map approval status to decision status
   */
  private mapToDecisionStatus(status: ApprovalStatus): DecisionSuggestionStatus {
    switch (status) {
      case 'Approved':
        return DecisionSuggestionStatus.Approved;
      case 'Rejected':
        return DecisionSuggestionStatus.Rejected;
      default:
        return DecisionSuggestionStatus.Suggested;
    }
  }

  /**
   * Map approval status to task status
   */
  private mapToTaskStatus(status: ApprovalStatus): TaskSuggestionStatus {
    switch (status) {
      case 'Approved':
        return TaskSuggestionStatus.Approved;
      case 'Rejected':
        return TaskSuggestionStatus.Rejected;
      default:
        return TaskSuggestionStatus.Suggested;
    }
  }
}
