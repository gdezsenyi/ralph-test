# US-005: Human Approval Workflow for Decisions

## Task

Implement the human approval workflow API and interface for reviewing, modifying, and approving/rejecting AI-suggested decisions. The interface must show all pending suggestions per meeting, allow text modification before approval, capture rejection reasons, maintain complete audit trail, and support batch operations. Maximum pending time before escalation is 72 hours.

## Context

Human-in-the-loop is a non-negotiable design principle for regulatory compliance (EU AI Act, MNB requirements). Every AI suggestion must be explicitly approved by a human before becoming actionable. The approval interface is critical for user adoption - it must be efficient to use while maintaining complete traceability.

## Requirements

- [ ] Display all pending suggestions per meeting grouped by type (decisions/tasks)
- [ ] Enable modification of text before approval
- [ ] Log both original AI text and final approved text in audit trail
- [ ] Require rejection reason before completing rejection
- [ ] Archive approved decisions with approver identity and timestamp
- [ ] Maintain complete audit trail (original suggestion, modifications, approver, timestamp)
- [ ] Support batch approval operations with confirmation
- [ ] Escalate to backup approver after 72 hours pending

## Technical Specifications

- Build FastAPI REST API for approval workflow
- Use Microsoft authentication (Azure AD via MSAL) for approver identity
- Approval states: pending -> approved/rejected/modified
- Audit log structure: `{suggestion_id, original_text, modified_text, action, actor_id, timestamp, reason}`
- Batch operations with confirmation
- Escalation service runs on schedule (every hour) checking for stale suggestions
- Support 'Approve All' with mandatory confirmation for meetings with many suggestions
- Frontend can be built later - focus on API first

## Files to Create/Modify

- `src/api/routes/approval_routes.py`
- `src/api/routes/test_approval_routes.py`
- `src/services/approval/approval_service.py`
- `src/services/approval/test_approval_service.py`
- `src/services/approval/escalation_service.py`
- `src/services/approval/test_escalation_service.py`
- `src/services/audit/audit_logger.py`
- `src/services/audit/test_audit_logger.py`
- `src/models/approval_audit_entry.py`
- `src/schemas/approval_schemas.py`

## Success Criteria

When complete:
- FastAPI endpoints for listing, approving, rejecting, modifying suggestions
- Single-item approve/reject/modify workflow functioning
- Batch approval endpoint working
- Rejection requires and stores reason
- Audit trail captures all required fields
- Modified text logged alongside original
- Escalation service triggers after 72 hours
- Azure AD authentication integrated via MSAL
- All unit tests pass with >80% coverage
- API documentation generated via OpenAPI/Swagger

## Verification

Run these commands to verify completion:
```bash
pytest src/api/routes/ -v --cov=src/api/routes --cov-fail-under=80
pytest src/services/approval/ -v --cov=src/services/approval --cov-fail-under=80
pytest src/services/audit/ -v --cov=src/services/audit --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_005_DECISION_APPROVAL_WORKFLOW_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-003 (AI-Suggested Decisions)

## If Stuck

- If Azure AD integration fails, verify app registration and redirect URIs
- If batch operations cause performance issues, implement pagination
- After 40 iterations, prioritize core single-item workflow over batch features

## Self-Correction

- Test approval workflow end-to-end: suggestion -> review -> approve/reject -> audit log
- Verify audit entries contain all required fields before marking complete
- Ensure rejection endpoint enforces non-empty reason
- Test escalation service with mocked time to verify 72-hour threshold
- Use FastAPI TestClient for API testing
