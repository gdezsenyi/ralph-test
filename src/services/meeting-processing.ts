/**
 * Meeting Processing Service Interface
 * US-004: Create meeting processing service interface
 *
 * This module defines service interfaces for meeting transcript processing.
 */

import { DecisionSuggestion } from '../models/decision-suggestion';
import { TaskSuggestion } from '../models/task-suggestion';

/**
 * Attendee information from a meeting
 */
export interface MeetingAttendee {
  /** User ID or email */
  userId: string;
  /** Display name */
  displayName: string;
  /** Role in the meeting */
  role: 'organizer' | 'presenter' | 'attendee';
  /** Whether the attendee actually joined */
  attended: boolean;
}

/**
 * Meeting data structure containing all meeting information
 */
export interface MeetingData {
  /** Unique identifier for the meeting */
  meetingId: string;

  /** Full transcript text of the meeting */
  transcript: string;

  /** List of meeting attendees */
  attendees: MeetingAttendee[];

  /** Meeting start time */
  startTime: Date;

  /** Meeting end time */
  endTime: Date;

  /** URL to the meeting recording (if available) */
  recordingUrl: string | null;

  /** Meeting subject/title */
  subject: string;

  /** Organizer of the meeting */
  organizer: MeetingAttendee;
}

/**
 * Result of processing a meeting transcript
 */
export interface ProcessingResult {
  /** Generated summary of the meeting */
  summary: string;

  /** Executive summary (shorter version for quick review) */
  executiveSummary: string;

  /** List of suggested decisions extracted from the meeting */
  decisionSuggestions: DecisionSuggestion[];

  /** List of suggested tasks extracted from the meeting */
  taskSuggestions: TaskSuggestion[];

  /** Processing metadata */
  metadata: ProcessingMetadata;
}

/**
 * Metadata about the processing operation
 */
export interface ProcessingMetadata {
  /** Time taken to process (in milliseconds) */
  processingTimeMs: number;

  /** Timestamp when processing completed */
  processedAt: Date;

  /** Version of the AI model used */
  modelVersion: string;

  /** Any warnings or notes about the processing */
  warnings: string[];
}

/**
 * Service interface for meeting processing operations
 */
export interface MeetingProcessingService {
  /**
   * Process a meeting transcript to extract all relevant information
   * @param meetingData The meeting data to process
   * @returns Complete processing result with summary, decisions, and tasks
   */
  processTranscript(meetingData: MeetingData): Promise<ProcessingResult>;

  /**
   * Generate a summary of the meeting
   * @param meetingData The meeting data
   * @returns Summary text and executive summary
   */
  generateSummary(meetingData: MeetingData): Promise<{
    summary: string;
    executiveSummary: string;
  }>;

  /**
   * Extract decision suggestions from a meeting transcript
   * @param transcript The transcript text
   * @param meetingId The meeting ID for source reference
   * @returns Array of decision suggestions
   */
  extractDecisions(transcript: string, meetingId: string): Promise<DecisionSuggestion[]>;

  /**
   * Extract task suggestions from a meeting transcript
   * @param transcript The transcript text
   * @param meetingId The meeting ID for source reference
   * @param attendees List of attendees for assignee matching
   * @returns Array of task suggestions
   */
  extractTasks(
    transcript: string,
    meetingId: string,
    attendees: MeetingAttendee[]
  ): Promise<TaskSuggestion[]>;
}

/**
 * Configuration options for the meeting processing service
 */
export interface MeetingProcessingConfig {
  /** Minimum confidence threshold for suggestions (0-100) */
  minConfidenceThreshold: number;

  /** Maximum number of suggestions per meeting */
  maxSuggestionsPerMeeting: number;

  /** Language of the meetings to process */
  language: 'en' | 'hu';

  /** Whether to include low-confidence suggestions with warnings */
  includeLowConfidence: boolean;
}

/**
 * Default configuration for meeting processing
 */
export const DEFAULT_MEETING_PROCESSING_CONFIG: MeetingProcessingConfig = {
  minConfidenceThreshold: 60,
  maxSuggestionsPerMeeting: 50,
  language: 'en',
  includeLowConfidence: true
};

/**
 * Calculate meeting duration in minutes
 */
export function getMeetingDurationMinutes(meetingData: MeetingData): number {
  return Math.round(
    (meetingData.endTime.getTime() - meetingData.startTime.getTime()) / 60000
  );
}

/**
 * Check if a meeting has a valid transcript
 */
export function hasValidTranscript(meetingData: MeetingData): boolean {
  return meetingData.transcript.trim().length > 100; // Minimum 100 characters
}
