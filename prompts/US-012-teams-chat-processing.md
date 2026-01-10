# US-012: Teams Chat Processing

## Task

Implement decision and task detection from Microsoft Teams chat messages. Process opted-in channels/chats for decision-like content. Notify participants when decisions are detected. Trigger approval workflow when archival is requested. Respect opt-in settings per channel.

## Context

Informal Teams chat discussions often contain decisions that never get formally recorded. This extends the decision capture to chat while maintaining strict privacy controls via opt-in. The informal nature of chat requires higher detection thresholds to avoid noise.

## Requirements

- [ ] Detect decisions in chat messages and notify participants (opted-in channels only)
- [ ] Trigger standard approval workflow when archival is requested
- [ ] Include chat context (thread excerpt with surrounding messages) in archived decisions
- [ ] Support mandatory opt-in per channel/chat
- [ ] Use higher detection threshold (>70%) for chat vs meetings to reduce noise

## Technical Specifications

- Use Microsoft Graph API for Teams chat access (ChannelMessage.Read.All permission)
- Implement Teams bot or messaging extension for notifications
- Opt-in configuration stored per channel/chat
- Higher confidence threshold: 70% vs 40% for meetings
- Chat context: include 5 messages before/after detected decision
- Notification via Teams adaptive card with 'Archive this decision' action
- Privacy: only process opted-in channels, log all access for audit

## Files to Create/Modify

- `src/services/chat/chat_processing_service.py`
- `src/services/chat/test_chat_processing_service.py`
- `src/services/chat/chat_decision_detector.py`
- `src/services/chat/test_chat_decision_detector.py`
- `src/integrations/teams/chat_client.py`
- `src/integrations/teams/test_chat_client.py`
- `src/models/chat_decision.py`
- `src/config/chat_opt_in.py`

## Success Criteria

When complete:
- ChatProcessingService monitors opted-in channels/chats
- Decision detection uses 70% confidence threshold
- Participants notified when decision detected
- Archive action triggers standard approval workflow
- Chat context (surrounding messages) included in archived decisions
- Opt-in configuration respected (only opted-in channels processed)
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/chat/ -v --cov=src/services/chat --cov-fail-under=80
pytest src/integrations/teams/test_chat_client.py -v
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_012_TEAMS_CHAT_PROCESSING_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-003 (AI-Suggested Decisions)
- US-005 (Human Approval Workflow for Decisions)
- US-007 (Decision Archive and Search)

## If Stuck

- If Teams bot approval is delayed, focus on backend API only
- If Graph API chat permissions are restricted, document requirements for IT
- If detection has too many false positives in chat, increase threshold to 80%
- After 35 iterations, prioritize core detection over rich notification features

## Self-Correction

- Test with opt-in and opted-out channels to verify privacy controls
- Check that chat context extraction handles deleted messages gracefully
- Monitor detection accuracy with informal chat language vs meeting transcripts
- Test notification delivery latency after chat message is sent
