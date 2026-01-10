# US-007: Decision Archive and Search

## Task

Implement the decision archive storage and search functionality. Store approved decisions in SharePoint with full metadata. Enable search by keyword, date range, meeting, and attendees. Search results must provide full context including decision text, meeting reference, approver, and related decisions. Support export to PDF/Excel for audit documentation.

## Context

The decision archive is the 'single source of truth' for executive decisions - a core value proposition. Compliance officers need to quickly locate decisions for audits, which currently takes weeks of manual searching. The 15-year retention requirement is critical for MNB compliance. Search must return results within 2 minutes.

## Requirements

- [ ] Enable keyword search across decision text and metadata
- [ ] Enable date range filtering
- [ ] Enable meeting/attendee filtering
- [ ] Show full context in search results (decision text, meeting reference, approver, approval date, category, related decisions)
- [ ] Link to original transcript/recording (if available within retention period)
- [ ] Export search results to PDF and Excel for audit documentation
- [ ] Support decision relationships (supersedes, relates to)

## Technical Specifications

- Use SharePoint Search or Azure Cognitive Search for full-text search
- Decision metadata: id, text, category, meeting_id, meeting_date, attendees, approver, approval_date, transcript_link, related_decisions
- Search response time target: <3 seconds
- Support compound filters (keyword + date + attendee)
- Export formats: PDF (formatted report), Excel (raw data)
- Decision relationships stored as links between decision IDs
- Index updated within 5 minutes of new decision archival
- Support pagination for large result sets (default 20 per page)

## Files to Create/Modify

- `src/api/routes/archive_routes.py`
- `src/api/routes/test_archive_routes.py`
- `src/services/archive/decision_archive_service.py`
- `src/services/archive/test_decision_archive_service.py`
- `src/services/search/decision_search_service.py`
- `src/services/search/test_decision_search_service.py`
- `src/services/export/export_service.py`
- `src/services/export/test_export_service.py`
- `src/integrations/sharepoint/sharepoint_search_client.py`
- `src/models/archived_decision.py`
- `src/schemas/search_schemas.py`

## Success Criteria

When complete:
- Archive API endpoints for CRUD and search operations
- Keyword search returns relevant results
- Date range and attendee filters working
- Full decision context returned on detail request
- Link to source transcript functional
- Related decisions shown when relationships exist
- PDF and Excel export working
- Search response time <3 seconds
- Pagination implemented for large result sets
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/archive/ -v --cov=src/services/archive --cov-fail-under=80
pytest src/services/search/ -v --cov=src/services/search --cov-fail-under=80
pytest src/services/export/ -v --cov=src/services/export --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_007_DECISION_ARCHIVE_SEARCH_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-005 (Human Approval Workflow for Decisions)

## If Stuck

- If SharePoint Search is too slow, consider Azure Cognitive Search as alternative
- If export fails for large result sets, implement chunked export
- If search indexing delays are too long, implement manual reindex trigger
- After 35 iterations, prioritize core search over export features

## Self-Correction

- Test search with realistic data volume (1000+ decisions)
- Verify filter combinations work correctly (AND logic)
- Check PDF export renders correctly with special characters
- Test Excel export opens correctly in Microsoft Excel
- Measure search response time and optimize if >3 seconds
