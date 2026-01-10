/**
 * SharePoint Decision Archive Schema
 * US-001: Create SharePoint decision archive schema
 *
 * This module defines the SharePoint list schema for storing archived decisions.
 */

/**
 * Source type for decisions - where the decision originated from
 */
export type SourceType = 'meeting' | 'email' | 'chat';

/**
 * Status of a decision in the archive
 */
export type DecisionStatus = 'active' | 'superseded' | 'archived';

/**
 * SharePoint list column definitions for the Decision Archive
 */
export interface DecisionArchiveSchema {
  /** Unique identifier for the decision (GUID format) */
  DecisionId: string;

  /** The full text of the decision */
  DecisionText: string;

  /** Reference to the source meeting (meeting ID or URL) */
  MeetingReference: string;

  /** User ID/email of the person who approved this decision */
  Approver: string;

  /** Date and time when the decision was approved */
  ApprovalDate: Date;

  /** The original AI-generated suggestion text before any modifications */
  OriginalAISuggestion: string;

  /** AI confidence score for the suggestion (0-100) */
  ConfidenceScore: number;

  /** Current status of the decision */
  Status: DecisionStatus;

  /** Timestamp when the record was created */
  CreatedAt: Date;

  /** Timestamp when the record was last modified */
  ModifiedAt: Date;

  /** Source type indicating where the decision came from */
  SourceType: SourceType;
}

/**
 * SharePoint column type definitions for schema creation
 */
export interface SharePointColumnDefinition {
  name: keyof DecisionArchiveSchema;
  type: 'Text' | 'Note' | 'DateTime' | 'Number' | 'Choice' | 'User';
  required: boolean;
  defaultValue?: string | number | boolean;
  choices?: string[];
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

/**
 * SharePoint list schema definition for Decision Archive
 */
export const decisionArchiveColumns: SharePointColumnDefinition[] = [
  {
    name: 'DecisionId',
    type: 'Text',
    required: true,
    maxLength: 50
  },
  {
    name: 'DecisionText',
    type: 'Note', // Multiline text
    required: true
  },
  {
    name: 'MeetingReference',
    type: 'Text',
    required: true,
    maxLength: 500
  },
  {
    name: 'Approver',
    type: 'User',
    required: true
  },
  {
    name: 'ApprovalDate',
    type: 'DateTime',
    required: true
  },
  {
    name: 'OriginalAISuggestion',
    type: 'Note', // Multiline text
    required: true
  },
  {
    name: 'ConfidenceScore',
    type: 'Number',
    required: true,
    minValue: 0,
    maxValue: 100
  },
  {
    name: 'Status',
    type: 'Choice',
    required: true,
    choices: ['active', 'superseded', 'archived'],
    defaultValue: 'active'
  },
  {
    name: 'CreatedAt',
    type: 'DateTime',
    required: true
  },
  {
    name: 'ModifiedAt',
    type: 'DateTime',
    required: true
  },
  {
    name: 'SourceType',
    type: 'Choice',
    required: true,
    choices: ['meeting', 'email', 'chat'],
    defaultValue: 'meeting'
  }
];

/**
 * Factory function to create a new decision archive entry
 */
export function createDecisionArchiveEntry(
  params: Omit<DecisionArchiveSchema, 'CreatedAt' | 'ModifiedAt'>
): DecisionArchiveSchema {
  const now = new Date();
  return {
    ...params,
    CreatedAt: now,
    ModifiedAt: now
  };
}

/**
 * Validates a confidence score is within valid range (0-100)
 */
export function validateConfidenceScore(score: number): boolean {
  return score >= 0 && score <= 100;
}

/**
 * SharePoint list configuration for the Decision Archive
 */
export const DECISION_ARCHIVE_LIST_CONFIG = {
  listName: 'DecisionArchive',
  listDescription: 'Archive of approved executive decisions from meetings, emails, and chats',
  enableVersioning: true,
  majorVersionLimit: 50
};
