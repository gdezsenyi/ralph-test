/**
 * Services Index
 *
 * Re-exports all service interfaces and utilities for easy importing.
 */

// Meeting Processing Service (US-004)
export {
  type MeetingAttendee,
  type MeetingData,
  type ProcessingResult,
  type ProcessingMetadata,
  type MeetingProcessingService,
  type MeetingProcessingConfig,
  DEFAULT_MEETING_PROCESSING_CONFIG,
  getMeetingDurationMinutes,
  hasValidTranscript
} from './meeting-processing';

// Graph API Client (US-005)
export {
  GraphApiError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  type AzureAdConfig,
  type AccessToken,
  type MeetingDetails,
  type TranscriptSegment,
  GraphApiClient,
  REQUIRED_GRAPH_SCOPES
} from './graph-api-client';

// AI Suggestion Service (US-006)
export {
  type AISuggestionConfig,
  DEFAULT_AI_CONFIG,
  AISuggestionService
} from './ai-suggestion-service';

// Approval Queue (US-007)
export {
  type ApprovalItemType,
  type ApprovalStatus,
  type ApprovalQueueItem,
  type ApprovalQueueFilter,
  ApprovalQueue
} from './approval-queue';

// Approval Workflow Service (US-008)
export {
  type ApprovalResult,
  type ApproveDecisionParams,
  type ApproveTaskParams,
  type RejectParams,
  type ModifyDecisionParams,
  type ModifyTaskParams,
  ApprovalWorkflowService
} from './approval-workflow';

// Planner Service (US-009)
export {
  type PlannerTaskData,
  type PlannerTask,
  type PlannerServiceConfig,
  PlannerService,
  PLANNER_PRIORITY
} from './planner-service';

// Decision Archive Service (US-010)
export {
  type DecisionArchiveServiceConfig,
  type ArchiveResult,
  type DecisionSearchParams,
  DecisionArchiveService
} from './decision-archive-service';
