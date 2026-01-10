# US-009: Email Decision Archival

## Task

Implement the workflow to archive decisions from flagged emails to the knowledge base. Allow users to review and modify AI-extracted decision text before archival. Maintain reference link to original email. Ensure email-based decisions appear in the same search results as meeting decisions.

## Context

Email decisions must be captured alongside meeting decisions to provide a complete executive decision history. The approval workflow maintains human-in-the-loop control. Email metadata (sender, recipients, date) provides important context for the decision.

## Requirements

- [ ] Enable archival from flagged emails with review/modify capability
- [ ] Include reference link to original email in archived decision
- [ ] Integrate with existing decision search (email decisions appear in same results)
- [ ] Preserve email metadata (sender, recipients, date, subject)
- [ ] Link related email decisions from same thread together

## Technical Specifications

- Extend approval workflow to support email sources
- Store email reference as Graph API message ID
- Email metadata: from, to, cc, date, subject, thread_id
- Use same archive storage as meeting decisions (SharePoint)
- Decision source types: 'meeting' | 'email' | 'chat'
- Email thread handling: link decisions with same conversation_id

## Files to Create/Modify

- `src/services/archive/email_decision_archive_service.py`
- `src/services/archive/test_email_decision_archive_service.py`
- `src/api/routes/email_archive_routes.py`
- `src/api/routes/test_email_archive_routes.py`
- `src/models/email_decision.py`
- `src/schemas/email_decision_schemas.py`

## Success Criteria

When complete:
- Email decision archival workflow implemented
- AI-extracted text editable before archival
- Email reference link stored and accessible
- Email metadata (sender, recipients, date, subject) preserved
- Email decisions appear in unified search results
- Thread-related decisions linked together
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/archive/test_email_decision_archive_service.py -v
pytest src/api/routes/test_email_archive_routes.py -v
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_009_EMAIL_DECISION_ARCHIVAL_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-007 (Decision Archive and Search)
- US-008 (Email Decision/Task Flagging)

## If Stuck

- If email reference links break over time, implement deep link fallback
- If thread linking logic is too complex, simplify to same-day same-sender grouping
- After 25 iterations, prioritize single-email archival over thread features

## Self-Correction

- Test archival workflow end-to-end from flagged email to search result
- Verify email reference links work after email is moved to different folder
- Check that unified search returns both meeting and email decisions
- Test thread linking with various email thread structures
