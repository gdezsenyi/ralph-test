/**
 * AI Suggestion Extraction Service
 * US-006: Create AI suggestion extraction service stub
 *
 * This module provides a stub service for AI-based decision/task extraction.
 * To be replaced with Microsoft Facilitator integration.
 */

import {
  DecisionSuggestion,
  createDecisionSuggestion
} from '../models/decision-suggestion';
import {
  TaskSuggestion,
  createTaskSuggestion,
  SourceReference
} from '../models/task-suggestion';
import { MeetingAttendee } from './meeting-processing';

/**
 * Configuration for the AI suggestion service
 */
export interface AISuggestionConfig {
  /** Minimum confidence threshold to include suggestions */
  minConfidenceThreshold: number;
  /** Whether to include low-confidence suggestions with warnings */
  includeLowConfidence: boolean;
  /** Language for analysis */
  language: 'en' | 'hu';
}

/**
 * Default configuration
 */
export const DEFAULT_AI_CONFIG: AISuggestionConfig = {
  minConfidenceThreshold: 40,
  includeLowConfidence: true,
  language: 'en'
};

/**
 * Generate a unique ID for suggestions
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * AI Suggestion Service - Stub Implementation
 *
 * This is a stub that returns mock data. In production, this would integrate
 * with Microsoft Facilitator or another AI service.
 */
export class AISuggestionService {
  constructor(private readonly config: AISuggestionConfig = DEFAULT_AI_CONFIG) {}

  /**
   * Extract decision suggestions from a transcript
   * @param transcript The meeting transcript text
   * @param meetingId The meeting ID for source reference
   * @returns Array of decision suggestions
   */
  async extractDecisions(
    transcript: string,
    meetingId: string
  ): Promise<DecisionSuggestion[]> {
    // Create source reference
    const sourceRef: SourceReference = {
      type: 'meeting',
      sourceId: meetingId
    };

    // In production, this would call an AI service to analyze the transcript
    // For now, return mock data with realistic confidence scores

    // Simple heuristic: look for decision-like phrases
    const decisionPatterns = [
      /we('ve| have)? decided to/gi,
      /the decision is/gi,
      /we('ll| will) (go with|proceed with)/gi,
      /it('s| is) agreed that/gi,
      /approved[:\s]/gi,
      /let's go with/gi,
      /final decision[:\s]/gi
    ];

    const suggestions: DecisionSuggestion[] = [];
    const lines = transcript.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of decisionPatterns) {
        if (pattern.test(line)) {
          // Extract context (surrounding lines)
          const contextStart = Math.max(0, i - 2);
          const contextEnd = Math.min(lines.length, i + 3);
          const context = lines.slice(contextStart, contextEnd).join('\n');

          // Generate realistic confidence score (60-95 for detected patterns)
          const confidence = Math.floor(Math.random() * 35) + 60;

          if (confidence >= this.config.minConfidenceThreshold || this.config.includeLowConfidence) {
            suggestions.push(
              createDecisionSuggestion(generateId('dec'), {
                decisionText: line.trim(),
                context: `Discussion leading to this decision`,
                transcriptExcerpt: context,
                confidenceScore: confidence,
                sourceReference: sourceRef
              })
            );
          }
          break; // Only one suggestion per line
        }
      }
    }

    // If no decisions found via patterns, return mock data for testing
    if (suggestions.length === 0 && transcript.length > 100) {
      suggestions.push(
        createDecisionSuggestion(generateId('dec'), {
          decisionText: 'The Q1 budget proposal is approved with the discussed amendments.',
          context: 'Budget discussion during the quarterly review meeting.',
          transcriptExcerpt: '[Simulated transcript excerpt - AI service integration pending]',
          confidenceScore: 85,
          sourceReference: sourceRef
        }),
        createDecisionSuggestion(generateId('dec'), {
          decisionText: 'New hiring process will be implemented starting next month.',
          context: 'HR policy discussion.',
          transcriptExcerpt: '[Simulated transcript excerpt - AI service integration pending]',
          confidenceScore: 72,
          sourceReference: sourceRef
        })
      );
    }

    return suggestions;
  }

  /**
   * Extract task suggestions from a transcript
   * @param transcript The meeting transcript text
   * @param meetingId The meeting ID for source reference
   * @param attendees List of attendees for assignee matching
   * @returns Array of task suggestions
   */
  async extractTasks(
    transcript: string,
    meetingId: string,
    attendees: MeetingAttendee[]
  ): Promise<TaskSuggestion[]> {
    const sourceRef: SourceReference = {
      type: 'meeting',
      sourceId: meetingId
    };

    // Task detection patterns
    const taskPatterns = [
      /(\w+) will (handle|take care of|complete|do|prepare|send|review)/gi,
      /action item[:\s]/gi,
      /TODO[:\s]/gi,
      /we need to/gi,
      /please (send|prepare|review|complete)/gi,
      /by (monday|tuesday|wednesday|thursday|friday|next week|end of week)/gi
    ];

    const suggestions: TaskSuggestion[] = [];
    const lines = transcript.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of taskPatterns) {
        const match = pattern.exec(line);
        if (match) {
          // Try to find assignee from attendees
          let suggestedAssignee: string | null = null;
          for (const attendee of attendees) {
            if (line.toLowerCase().includes(attendee.displayName.toLowerCase())) {
              suggestedAssignee = attendee.userId;
              break;
            }
          }

          // Generate realistic confidence score
          const confidence = Math.floor(Math.random() * 30) + 55;

          // Try to detect due date mentions
          let suggestedDueDate: Date | null = null;
          const dueDateMatch = line.match(/by (monday|tuesday|wednesday|thursday|friday|next week|end of week)/i);
          if (dueDateMatch) {
            // Simple due date calculation (next occurrence of day)
            suggestedDueDate = this.calculateDueDate(dueDateMatch[1]);
          }

          if (confidence >= this.config.minConfidenceThreshold || this.config.includeLowConfidence) {
            suggestions.push(
              createTaskSuggestion(generateId('task'), {
                description: line.trim(),
                suggestedAssignee,
                suggestedDueDate,
                confidenceScore: confidence,
                sourceReference: sourceRef
              })
            );
          }
          break;
        }
      }
    }

    // If no tasks found, return mock data for testing
    if (suggestions.length === 0 && transcript.length > 100) {
      const mockAssignee = attendees.length > 0 ? attendees[0].userId : null;

      suggestions.push(
        createTaskSuggestion(generateId('task'), {
          description: 'Prepare the revised budget document with Q2 projections',
          suggestedAssignee: mockAssignee,
          suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
          confidenceScore: 78,
          sourceReference: sourceRef
        }),
        createTaskSuggestion(generateId('task'), {
          description: 'Schedule follow-up meeting with stakeholders',
          suggestedAssignee: null, // Unassigned
          suggestedDueDate: null,
          confidenceScore: 65,
          sourceReference: sourceRef
        })
      );
    }

    return suggestions;
  }

  /**
   * Calculate due date from natural language
   */
  private calculateDueDate(dueDateText: string): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const dayMap: Record<string, number> = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5
    };

    const targetDay = dayMap[dueDateText.toLowerCase()];
    if (targetDay !== undefined) {
      let daysUntil = targetDay - dayOfWeek;
      if (daysUntil <= 0) daysUntil += 7;
      return new Date(today.getTime() + daysUntil * 24 * 60 * 60 * 1000);
    }

    if (dueDateText.toLowerCase() === 'next week') {
      return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    if (dueDateText.toLowerCase() === 'end of week') {
      const daysUntilFriday = 5 - dayOfWeek;
      return new Date(today.getTime() + Math.max(0, daysUntilFriday) * 24 * 60 * 60 * 1000);
    }

    // Default: 1 week from now
    return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Process a full transcript and return all suggestions
   */
  async processTranscript(
    transcript: string,
    meetingId: string,
    attendees: MeetingAttendee[]
  ): Promise<{
    decisions: DecisionSuggestion[];
    tasks: TaskSuggestion[];
  }> {
    const [decisions, tasks] = await Promise.all([
      this.extractDecisions(transcript, meetingId),
      this.extractTasks(transcript, meetingId, attendees)
    ]);

    return { decisions, tasks };
  }
}
