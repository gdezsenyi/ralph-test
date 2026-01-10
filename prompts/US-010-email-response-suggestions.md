# US-010: Email Response Suggestions

## Task

Implement AI-generated response suggestions for standard inquiry emails. When an executive opens an email that matches standard inquiry patterns, show a suggested response option. The response opens in compose mode for review and modification. Never auto-send - always require human action.

## Context

Executives receive many routine inquiry emails that have standard responses. AI suggestions speed up response time while maintaining human control. Suggestions must respect organizational tone and style. Privacy is critical - no suggestions for sensitive topics.

## Requirements

- [ ] Show response suggestions for standard inquiry emails
- [ ] Open suggestion in compose mode for review before sending
- [ ] Log modifications to suggestions for model improvement
- [ ] Enable suggestion feedback when rejected
- [ ] Respect organizational tone and style guidelines
- [ ] Skip sensitive topics (HR, legal, confidential) - no suggestions offered

## Technical Specifications

- Standard inquiry patterns: meeting requests, status requests, information requests, approval requests
- Sensitive topic detection: keywords for HR, legal, confidential, personal matters
- Response templates configurable by organization
- Never implement auto-send functionality
- Log: suggestion_id, original_suggestion, final_sent, was_modified, feedback

## Files to Create/Modify

- `src/services/email/response_suggestion_service.py`
- `src/services/email/test_response_suggestion_service.py`
- `src/services/email/sensitive_topic_detector.py`
- `src/services/email/test_sensitive_topic_detector.py`
- `src/models/response_suggestion.py`
- `src/config/response_templates.py`

## Success Criteria

When complete:
- ResponseSuggestionService generates suggestions for standard inquiries
- Sensitive topics correctly excluded from suggestions
- Modification logging captures changes made
- Feedback mechanism for rejected suggestions
- No auto-send functionality exists
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/email/test_response_suggestion_service.py -v
pytest src/services/email/test_sensitive_topic_detector.py -v
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_010_EMAIL_RESPONSE_SUGGESTIONS_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-008 (Email Decision/Task Flagging)

## If Stuck

- If response quality is poor, focus on template-based responses first
- If sensitive topic detection has high false negatives, expand keyword list
- After 25 iterations, prioritize core suggestion over feedback features

## Self-Correction

- Test with diverse email types: meeting requests, status updates, questions
- Verify sensitive topic detection catches HR, legal, personal content
- Confirm no code path exists that could auto-send
- Test suggestion quality against organizational style guidelines
