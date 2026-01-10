# US-002: AI-Generated Meeting Summary

## Task

Implement AI-generated meeting summaries using Microsoft Facilitator. When a meeting transcript is available, generate a draft summary within 1 hour that includes attendees, duration, key topics discussed, and next steps. All summaries must be marked as 'DRAFT - Pending Approval' until human review.

## Context

Executive assistants currently spend significant time creating meeting minutes manually. AI-generated summaries reduce this burden while ensuring consistency. Summaries serve as the foundation for decision and task extraction. The human-in-the-loop principle requires all AI output to be clearly marked as draft.

## Requirements

- [ ] Generate summary within 1 hour of transcript availability
- [ ] Include required summary components (attendees, duration, topics, next steps)
- [ ] Capture all significant discussion points (topics >2 minutes)
- [ ] Mark all summaries as 'DRAFT - Pending Approval' with timestamp
- [ ] Scale summary length with meeting duration (~1 page per 1-hour meeting)

## Technical Specifications

- Use Microsoft Facilitator API for summary generation
- Summary structure: Header (meeting info) -> Attendees -> Key Topics -> Discussion Points -> Next Steps -> Footer (draft status)
- Implement SummaryService with `generate_summary()`, `get_summary_status()`, and `update_summary_status()` methods
- Store summaries alongside transcripts in SharePoint: `/sites/ExecutiveDecisions/Summaries/{Year}/{Month}/`
- Link summaries to source transcripts via metadata
- Target summary length: 250 words per 30 minutes of meeting
- Include confidence indicators for extracted information
- Support processing queue for multiple concurrent meetings

## Files to Create/Modify

- `src/services/summary/summary_service.py`
- `src/services/summary/test_summary_service.py`
- `src/services/summary/summary_generator.py`
- `src/services/summary/test_summary_generator.py`
- `src/integrations/facilitator/facilitator_client.py`
- `src/integrations/facilitator/test_facilitator_client.py`
- `src/models/summary.py`
- `src/queue/summary_processing_queue.py`

## Success Criteria

When complete:
- SummaryService class implemented with all required methods
- FacilitatorClient successfully calls Microsoft Facilitator API
- Generated summaries contain all required sections (attendees, duration, topics, next steps)
- All summaries have 'DRAFT - Pending Approval' status on creation
- Summaries stored in SharePoint with link to source transcript
- Processing queue handles multiple meetings without blocking
- Summary length scales appropriately with meeting duration
- All unit tests pass with >80% coverage
- Integration test with mock Facilitator API succeeds

## Verification

Run these commands to verify completion:
```bash
pytest src/services/summary/ -v --cov=src/services/summary --cov-fail-under=80
pytest src/integrations/facilitator/ -v --cov=src/integrations/facilitator --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_002_MEETING_SUMMARY_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-001 (Automatic Transcript Generation) must be complete

## If Stuck

- If Facilitator API returns errors, verify API endpoint and authentication credentials
- If summaries are too short/long, adjust the word-per-minute ratio and retest
- If required sections are missing, review Facilitator prompt engineering
- After 25 iterations without progress, document Facilitator API limitations

## Self-Correction

- Test summary generation with transcripts of varying lengths (15min, 30min, 1hr, 2hr)
- Verify summary structure matches required format before storage
- Check that draft status is set before any storage operation
- Monitor processing queue for deadlocks or memory issues
- Compare generated summaries against transcripts manually for first 5 meetings
