/**
 * Microsoft Planner Integration Service
 * US-009: Create Planner integration service
 *
 * This module provides a service to create tasks in Microsoft Planner.
 */

import { TaskSuggestion, TaskSuggestionStatus } from '../models/task-suggestion';
import { AzureAdConfig, GraphApiError, AuthenticationError } from './graph-api-client';

/**
 * Planner task data for creation
 */
export interface PlannerTaskData {
  /** Task title */
  title: string;
  /** Task assignee (user ID) */
  assigneeId: string;
  /** Due date (optional) */
  dueDate?: Date;
  /** Task notes/description */
  notes?: string;
  /** Reference link to the source meeting */
  meetingReferenceUrl?: string;
  /** Priority (1=Urgent, 3=Important, 5=Medium, 9=Low) */
  priority?: 1 | 3 | 5 | 9;
}

/**
 * Created task response from Planner
 */
export interface PlannerTask {
  /** Planner task ID */
  id: string;
  /** Task title */
  title: string;
  /** Assignee user IDs */
  assignees: string[];
  /** Due date */
  dueDateTime?: Date;
  /** Creation timestamp */
  createdDateTime: Date;
  /** URL to view the task in Planner */
  webUrl: string;
  /** Bucket ID the task is in */
  bucketId?: string;
  /** Plan ID the task belongs to */
  planId: string;
}

/**
 * Planner service configuration
 */
export interface PlannerServiceConfig {
  /** Azure AD configuration for authentication */
  azureAdConfig: AzureAdConfig;
  /** ID of the Planner plan to create tasks in */
  planId: string;
  /** Default bucket ID for new tasks (optional) */
  defaultBucketId?: string;
  /** Base URL for meeting references */
  meetingBaseUrl?: string;
}

/**
 * Microsoft Planner Integration Service
 *
 * Creates tasks in Microsoft Planner via the Graph API.
 */
export class PlannerService {
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(private readonly config: PlannerServiceConfig) {}

  /**
   * Create a task in Microsoft Planner
   * @param taskData The task data to create
   * @returns The created Planner task with ID and details
   */
  async createTask(taskData: PlannerTaskData): Promise<PlannerTask> {
    // Validate required fields
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (!taskData.assigneeId || taskData.assigneeId.trim().length === 0) {
      throw new Error('Task assignee is required');
    }

    // Build the task creation payload for Graph API
    const payload = this.buildTaskPayload(taskData);

    // In production, this would call the Graph API:
    // POST /planner/tasks
    // with the payload

    // For now, return a simulated response
    // This stub simulates successful task creation
    const createdTask: PlannerTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      assignees: [taskData.assigneeId],
      dueDateTime: taskData.dueDate,
      createdDateTime: new Date(),
      webUrl: `https://tasks.office.com/plan/${this.config.planId}/task/${Date.now()}`,
      bucketId: this.config.defaultBucketId,
      planId: this.config.planId
    };

    // Log for debugging (in production, would be actual API call)
    console.log('PlannerService.createTask: Would create task via Graph API:', payload);

    return createdTask;
  }

  /**
   * Create a task from an approved TaskSuggestion
   * @param suggestion The approved task suggestion
   * @param meetingId The source meeting ID for reference
   * @returns The created Planner task
   */
  async createTaskFromSuggestion(
    suggestion: TaskSuggestion,
    meetingId: string
  ): Promise<PlannerTask> {
    // Verify the task is approved
    if (suggestion.status !== TaskSuggestionStatus.Approved) {
      throw new Error('Cannot create Planner task from unapproved suggestion');
    }

    // Verify we have an assignee
    const assignee = suggestion.finalAssignee ?? suggestion.suggestedAssignee;
    if (!assignee) {
      throw new Error('Task must have an assignee before creating in Planner');
    }

    // Build meeting reference URL
    const meetingUrl = this.config.meetingBaseUrl
      ? `${this.config.meetingBaseUrl}/meeting/${meetingId}`
      : `Meeting reference: ${meetingId}`;

    // Create the task
    const taskData: PlannerTaskData = {
      title: suggestion.modifiedDescription ?? suggestion.description,
      assigneeId: assignee,
      dueDate: suggestion.finalDueDate ?? suggestion.suggestedDueDate ?? undefined,
      notes: this.buildTaskNotes(suggestion, meetingId),
      meetingReferenceUrl: meetingUrl,
      priority: 5 // Default to Medium priority
    };

    return this.createTask(taskData);
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: Partial<PlannerTaskData>
  ): Promise<PlannerTask> {
    // In production: PATCH /planner/tasks/{taskId}
    // Requires ETag for optimistic concurrency

    throw new Error(`updateTask: Requires Graph API implementation for task ${taskId}`);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    // In production: DELETE /planner/tasks/{taskId}

    throw new Error(`deleteTask: Requires Graph API implementation for task ${taskId}`);
  }

  /**
   * Get a task by ID
   */
  async getTask(taskId: string): Promise<PlannerTask> {
    // In production: GET /planner/tasks/{taskId}

    throw new Error(`getTask: Requires Graph API implementation for task ${taskId}`);
  }

  /**
   * List tasks in the configured plan
   */
  async listTasks(): Promise<PlannerTask[]> {
    // In production: GET /planner/plans/{planId}/tasks

    throw new Error('listTasks: Requires Graph API implementation');
  }

  /**
   * Build the Graph API payload for task creation
   */
  private buildTaskPayload(taskData: PlannerTaskData): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      planId: this.config.planId,
      title: taskData.title,
      assignments: {
        [taskData.assigneeId]: {
          '@odata.type': '#microsoft.graph.plannerAssignment',
          orderHint: ' !'
        }
      }
    };

    if (this.config.defaultBucketId) {
      payload.bucketId = this.config.defaultBucketId;
    }

    if (taskData.dueDate) {
      payload.dueDateTime = taskData.dueDate.toISOString();
    }

    if (taskData.priority) {
      payload.priority = taskData.priority;
    }

    return payload;
  }

  /**
   * Build task notes with meeting reference
   */
  private buildTaskNotes(suggestion: TaskSuggestion, meetingId: string): string {
    const lines: string[] = [];

    lines.push('## Task from Executive Support System');
    lines.push('');
    lines.push(`**Source:** ${suggestion.sourceReference.type}`);
    lines.push(`**Meeting ID:** ${meetingId}`);
    lines.push(`**AI Confidence:** ${suggestion.confidenceScore}%`);
    lines.push('');

    if (suggestion.modifiedDescription && suggestion.modifiedDescription !== suggestion.description) {
      lines.push('**Original suggestion:**');
      lines.push(suggestion.description);
      lines.push('');
      lines.push('**Modified to:**');
      lines.push(suggestion.modifiedDescription);
    } else {
      lines.push('**Description:**');
      lines.push(suggestion.description);
    }

    lines.push('');
    lines.push(`_Created: ${new Date().toISOString()}_`);

    return lines.join('\n');
  }
}

/**
 * Default Planner priority values
 */
export const PLANNER_PRIORITY = {
  URGENT: 1 as const,
  IMPORTANT: 3 as const,
  MEDIUM: 5 as const,
  LOW: 9 as const
};
