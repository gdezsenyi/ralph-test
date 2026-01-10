# US-006: Human Approval Workflow for Tasks

## Task

Implement the human approval workflow for AI-suggested tasks. Allow approvers to review, modify (description, assignee, due date, priority), and approve/reject task suggestions. Upon approval, create tasks in Microsoft Planner with links back to source meeting. Assignee is mandatory before approval.

## Context

Task suggestions must go through human approval before being created in Microsoft Planner. Approvers need ability to modify all task fields since AI suggestions may have incorrect assignees or due dates. The link back to source meeting provides critical context for task owners.

## Requirements

- [ ] Enable modification of task fields (description, assignee, due date, priority) on approval
- [ ] Require assignee before approval completes
- [ ] Create task in Microsoft Planner on approval (configured plan/bucket)
- [ ] Include source meeting link in Planner task
- [ ] Support assignment to individuals or Microsoft 365 groups

## Technical Specifications

- Integrate with Microsoft Planner API (Graph API) for task creation
- Support configurable Planner plan and bucket structure
- Task fields: title, description, assignee(s), due date, priority (urgent/important/medium/low)
- Include meeting link in task notes/description
- Batch task approval supported
- Audit trail for task approvals same as decisions
- Assignee search with Azure AD user/group lookup

## Files to Create/Modify

- `src/api/routes/task_approval_routes.py`
- `src/api/routes/test_task_approval_routes.py`
- `src/services/approval/task_approval_service.py`
- `src/services/approval/test_task_approval_service.py`
- `src/integrations/planner/planner_client.py`
- `src/integrations/planner/test_planner_client.py`
- `src/services/users/user_search_service.py`
- `src/services/users/test_user_search_service.py`
- `src/schemas/task_approval_schemas.py`

## Success Criteria

When complete:
- Task approval API with editable fields (description, assignee, due date, priority)
- Assignee mandatory validation before approval
- User search returns Azure AD users and groups
- PlannerClient creates tasks via Graph API
- Created tasks include source meeting link
- Batch task approval working
- Audit trail captures task approval events
- All unit tests pass with >80% coverage
- Integration test with mock Planner API succeeds

## Verification

Run these commands to verify completion:
```bash
pytest src/api/routes/test_task_approval_routes.py -v
pytest src/services/approval/test_task_approval_service.py -v
pytest src/integrations/planner/ -v --cov=src/integrations/planner --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_006_TASK_APPROVAL_WORKFLOW_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-004 (AI-Suggested Tasks)
- US-005 (Human Approval Workflow for Decisions)

## If Stuck

- If Planner API returns permission errors, verify Tasks.ReadWrite permission in Azure AD app
- If group assignment fails, check if groups have Planner enabled
- If task creation times out, implement retry logic with smaller batches
- After 30 iterations without Planner integration, mock the integration and document blockers

## Self-Correction

- Test Planner task creation with Graph Explorer first
- Verify assignee validation blocks approval when no assignee selected
- Check that meeting link in task description is clickable
- Test batch approval with mixed valid/invalid tasks
- Ensure audit events capture all task field changes
