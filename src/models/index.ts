/**
 * Models Index
 *
 * Re-exports all model types and utilities for easy importing.
 */

// Decision Archive (US-001)
export {
  type SourceType,
  type DecisionStatus,
  type DecisionArchiveSchema,
  type SharePointColumnDefinition,
  decisionArchiveColumns,
  createDecisionArchiveEntry,
  validateConfidenceScore,
  DECISION_ARCHIVE_LIST_CONFIG
} from './decision-archive';

// Task Suggestion (US-002)
export {
  TaskSuggestionStatus,
  type SourceReference,
  type TaskSuggestion,
  type CreateTaskSuggestionParams,
  createTaskSuggestion,
  approveTaskSuggestion,
  rejectTaskSuggestion,
  modifyTaskSuggestion,
  isTaskProcessed,
  isTaskPending
} from './task-suggestion';

// Decision Suggestion (US-003)
export {
  DecisionSuggestionStatus,
  type DecisionSuggestion,
  type CreateDecisionSuggestionParams,
  createDecisionSuggestion,
  approveDecisionSuggestion,
  rejectDecisionSuggestion,
  modifyDecisionSuggestion,
  approveModifiedDecisionSuggestion,
  getFinalDecisionText,
  isDecisionProcessed,
  isDecisionPending,
  type ConfidenceLevel,
  getConfidenceLevel
} from './decision-suggestion';
