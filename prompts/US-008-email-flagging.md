# US-008: Email Decision/Task Flagging

## Task

Implement AI-powered detection of decisions and tasks within incoming emails. Flag emails containing potential decisions or tasks with visual indicators in Outlook. Highlight the specific sections where decisions/tasks were detected. Allow users to dismiss flags after review.

## Context

Executive decisions often happen via email but get lost in inbox volume. Email flagging surfaces important items without requiring constant monitoring. The flagging should appear within 15 minutes of email receipt. Integration should feel native to the Outlook experience.

## Requirements

- [ ] Flag emails containing potential decisions with 'Contains Possible Decision' indicator
- [ ] Flag emails containing potential tasks with 'Contains Possible Task' indicator
- [ ] Highlight specific sections where decisions/tasks were detected
- [ ] Enable flag dismissal with 'Reviewed - No Action Needed' status
- [ ] Process emails within 15 minutes of receipt

## Technical Specifications

- Use Microsoft Graph API for email access (Mail.Read permission)
- Implement Outlook Add-in for native flagging experience
- Use message extensions or categories for visual flags
- Process emails through message queue for scalability
- Apply same detection patterns as meeting decisions/tasks (US-003, US-004)
- Store flagging data in user's mailbox extended properties or external store
- Consider processing latency - target <15 minutes from receipt

## Files to Create/Modify

- `src/services/email/email_processing_service.py`
- `src/services/email/test_email_processing_service.py`
- `src/services/email/email_decision_detector.py`
- `src/services/email/test_email_decision_detector.py`
- `src/integrations/graph/mail_client.py`
- `src/integrations/graph/test_mail_client.py`
- `src/models/email_flag.py`
- `src/queue/email_processing_queue.py`

## Success Criteria

When complete:
- EmailProcessingService processes incoming emails
- Decision and task detection patterns applied to emails
- Flagging mechanism stores flag status
- Detected sections can be highlighted
- Flag dismissal with 'Reviewed - No Action Needed' status
- Processing completes within 15 minutes
- Queue handles high email volume without backlog
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/email/ -v --cov=src/services/email --cov-fail-under=80
pytest src/integrations/graph/test_mail_client.py -v
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_008_EMAIL_FLAGGING_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-003 (AI-Suggested Decisions)
- US-004 (AI-Suggested Tasks)

## If Stuck

- If Outlook Add-in approval delays occur, focus on backend API only
- If email volume causes processing delays >15min, implement prioritization
- If Graph API throttling occurs, implement proper retry with backoff
- After 30 iterations, document any Outlook Add-in limitations

## Self-Correction

- Test with various email formats: plain text, HTML, with attachments
- Monitor queue depth and processing times during testing
- Check Graph API permission scopes are correctly configured
- Test flag dismissal persists correctly
