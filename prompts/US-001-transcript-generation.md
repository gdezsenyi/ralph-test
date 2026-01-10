# US-001: Automatic Transcript Generation

## Task

Implement automatic transcript generation for Microsoft Teams meetings. When a Teams meeting with recording enabled ends, the system must automatically generate a transcript within 30 minutes, correctly identify speakers, and handle failures gracefully by notifying the meeting organizer.

## Context

Executives currently rely on manual note-taking or memory for meeting content. This causes decision evaporation and context loss. Automatic transcription is the foundation for AI-assisted decision and task extraction in later phases. This integrates with Microsoft Teams native transcription capabilities.

## Requirements

- [ ] Generate transcript within 30 minutes after meeting ends
- [ ] Correctly identify speakers in multi-speaker meetings
- [ ] Notify organizer on transcription failure via Teams notification
- [ ] Respect confidential meeting settings (skip when recording disabled)
- [ ] Store transcripts in SharePoint with appropriate permissions

## Technical Specifications

- Leverage Microsoft Teams native transcription via Graph API
- Use Microsoft Graph API subscription for meeting end events
- Store transcripts in SharePoint document library: `/sites/ExecutiveDecisions/Transcripts/{Year}/{Month}/`
- Implement webhook handler for Teams meeting lifecycle events
- Use Azure AD for authentication and permission management
- Implement retry logic with exponential backoff (3 attempts, 5s/15s/45s delays)
- Log all transcription events for audit trail (15-year retention requirement)
- Support English and Hungarian language content

## Files to Create/Modify

- `src/services/transcription/transcription_service.py`
- `src/services/transcription/test_transcription_service.py`
- `src/integrations/teams/meeting_webhook_handler.py`
- `src/integrations/teams/test_meeting_webhook_handler.py`
- `src/integrations/sharepoint/transcript_storage.py`
- `src/integrations/sharepoint/test_transcript_storage.py`
- `src/integrations/graph/graph_client.py`
- `src/notifications/teams_notifier.py`
- `src/models/transcription.py`
- `src/models/meeting.py`

## Success Criteria

When complete:
- TranscriptionService class implemented with `trigger_transcription()`, `get_status()`, and `store_transcript()` methods
- MeetingWebhookHandler receives and processes meeting end events
- Transcripts successfully stored in SharePoint with correct folder structure
- Speaker identification labels present in transcripts
- Error notifications sent to organizer via Teams when transcription fails
- Confidential meetings (recording disabled) are skipped
- All unit tests pass with >80% coverage
- Integration tests with mock Graph API succeed
- Audit logging captures all transcription events

## Verification

Run these commands to verify completion:
```bash
pytest src/services/transcription/ -v --cov=src/services/transcription --cov-fail-under=80
pytest src/integrations/teams/ -v --cov=src/integrations/teams --cov-fail-under=80
pytest src/integrations/sharepoint/ -v --cov=src/integrations/sharepoint --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_001_TRANSCRIPT_GENERATION_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## If Stuck

- If Graph API authentication fails after 5 attempts, document required Azure AD permissions and pause
- If SharePoint storage fails, verify site URL exists and app has Sites.ReadWrite.All permission
- If webhook subscription fails, check Graph API subscription limits and notification URL accessibility
- After 30 iterations without progress, create detailed blocker report with attempted solutions

## Self-Correction

- Run tests after each file change: `pytest src/path/to/test_file.py -v`
- Check Graph API response codes: 401=auth issue, 403=permission issue, 404=resource not found
- Verify SharePoint site exists before attempting storage operations
- Use Graph Explorer (https://developer.microsoft.com/graph/graph-explorer) to test API calls manually
- Check Azure AD app registration has required permissions: OnlineMeetings.Read.All, Sites.ReadWrite.All
- Review webhook payload structure in Teams developer documentation
