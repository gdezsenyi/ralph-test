# US-004: AI-Suggested Tasks

## Task

Implement AI-powered task/action item detection from meeting transcripts. Identify statements that appear to be action items, suggest assignees from the organization directory, extract mentioned due dates, and assign confidence scores. Tasks without clear assignees must show 'Unassigned - Human Input Required'. All suggestions start with 'Suggested' status.

## Context

Action items from leadership meetings frequently fall through the cracks because they're mentioned but never formally assigned or tracked. AI detection ensures no tasks are missed while requiring human approval before creating items in Microsoft Planner. The system must map suggested assignees to the organization directory.

## Requirements

- [ ] Identify action item statements in transcripts
- [ ] Include task metadata (description, assignee, due date, confidence score)
- [ ] Flag tasks without clear assignee as 'Unassigned - Human Input Required'
- [ ] Flag tasks without due date as 'No Due Date - Human Input Required'
- [ ] Initialize all suggestions with 'Suggested' status (NOT created in Planner)
- [ ] Map assignee names to Azure AD users with >80% confidence or flag for manual selection

## Technical Specifications

- Task detection patterns:
  - Explicit assignments: "John, please...", "Can you..."
  - Commitments: "I will...", "I'll take care of..."
  - Action language: "needs to be done", "action item:", "TODO:"
- Due date detection: explicit dates, relative dates ('by Friday', 'next week', 'end of month'), deadline keywords
- Assignee matching: Use Microsoft Graph API to search Azure AD users by display name
- Store suggestions with status: 'suggested' | 'approved' | 'rejected' | 'modified'
- Include transcript context with each suggestion
- Support priority inference: urgent, high, normal, low based on language cues

## Files to Create/Modify

- `src/services/tasks/task_detection_service.py`
- `src/services/tasks/test_task_detection_service.py`
- `src/services/tasks/task_extractor.py`
- `src/services/tasks/test_task_extractor.py`
- `src/services/tasks/assignee_resolver.py`
- `src/services/tasks/test_assignee_resolver.py`
- `src/services/tasks/due_date_parser.py`
- `src/services/tasks/test_due_date_parser.py`
- `src/models/task_suggestion.py`
- `src/repositories/task_suggestion_repository.py`

## Success Criteria

When complete:
- TaskDetectionService identifies action items from transcripts
- Assignee names matched to Azure AD users via Graph API
- Unmatched assignees flagged as 'Unassigned - Human Input Required'
- Due dates parsed from various formats (explicit, relative)
- Missing due dates flagged appropriately
- All suggestions created with 'Suggested' status
- Priority inference working based on language cues
- Transcript context included with suggestions
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/tasks/ -v --cov=src/services/tasks --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_004_TASK_DETECTION_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-001 (Automatic Transcript Generation)
- US-002 (AI-Generated Meeting Summary)

## If Stuck

- If assignee matching accuracy is too low, expand search to include email aliases and nicknames
- If due date parsing fails on common formats, add more date format patterns
- If too many false positives, review and tighten detection patterns
- After 35 iterations without progress, document edge cases for manual handling

## Self-Correction

- Test DueDateParser with diverse date formats: '1/15/2026', 'January 15th', 'next Friday', 'EOD', 'Q1'
- Test AssigneeResolver with full names, first names only, nicknames, and email addresses
- Verify 'Suggested' status is always set before persistence
- Check that transcript context provides sufficient surrounding text for human review
- Monitor detection patterns for meeting types: formal vs informal language
