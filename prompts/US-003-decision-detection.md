# US-003: AI-Suggested Decisions

## Task

Implement AI-powered decision detection from meeting transcripts. The system must identify statements that appear to be decisions, extract them with context and rationale, assign confidence scores, and present them for human approval. Low-confidence suggestions must be clearly marked. All suggestions start with 'Suggested' status - never auto-approved or archived.

## Context

Executive decisions frequently get lost or disputed because they're mentioned in meetings but never formally recorded. AI detection ensures no decisions are missed while maintaining human oversight. The system must identify explicit decisions ('We've decided to...'), consensus statements, and directional choices. This is critical for the 15-year audit trail requirement.

## Requirements

- [ ] Identify decision-like statements in transcripts with >60% confidence
- [ ] Include decision context and metadata (text, rationale, timestamp, speaker, confidence)
- [ ] Mark low-confidence suggestions (40-60%) as 'Low Confidence - Review Carefully'
- [ ] Enable rejection with feedback for model improvement
- [ ] Initialize all suggestions with 'Suggested' status (NOT approved, NOT archived)
- [ ] Include original transcript excerpt (30 seconds context) for verification

## Technical Specifications

- Use Microsoft Facilitator or Azure OpenAI for decision detection
- Decision detection patterns:
  - Explicit decisions: "We've decided to...", "The decision is..."
  - Consensus: "We all agree..."
  - Directional choices: "We will go with...", "Let's proceed with..."
- Confidence threshold for display: >= 40% (below 40% logged but not shown)
- Store suggestions in database with status: 'suggested' | 'approved' | 'rejected' | 'modified'
- Include transcript excerpt: 30 seconds before and after the detected statement
- Categorize decisions: Strategic Direction, Policy/Procedure, Resource Allocation, Approval/Rejection, Assignment, Timeline/Deadline
- Log all suggestions and outcomes for AI model improvement

## Files to Create/Modify

- `src/services/decisions/decision_detection_service.py`
- `src/services/decisions/test_decision_detection_service.py`
- `src/services/decisions/decision_extractor.py`
- `src/services/decisions/test_decision_extractor.py`
- `src/models/decision.py`
- `src/models/decision_suggestion.py`
- `src/repositories/decision_suggestion_repository.py`
- `src/repositories/test_decision_suggestion_repository.py`

## Success Criteria

When complete:
- DecisionDetectionService identifies decisions from transcripts
- Confidence scores assigned to all suggestions (0-100%)
- Suggestions with <40% confidence logged but not displayed
- Suggestions with 40-60% confidence marked as 'Low Confidence'
- All suggestions created with 'Suggested' status
- Transcript excerpts included with each suggestion
- Decision categories assigned automatically
- Rejection reasons captured and stored
- All unit tests pass with >80% coverage

## Verification

Run these commands to verify completion:
```bash
pytest src/services/decisions/ -v --cov=src/services/decisions --cov-fail-under=80
pytest src/repositories/ -v --cov=src/repositories --cov-fail-under=80
ruff check src/
mypy src/
```

## Completion

Output `<promise>US_003_DECISION_DETECTION_COMPLETE</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass with >80% coverage
- All files created/modified as specified
- Verification commands pass

## Dependencies

- US-001 (Automatic Transcript Generation)
- US-002 (AI-Generated Meeting Summary)

## If Stuck

- If decision detection accuracy is too low (<50% relevant), review and tune detection patterns
- If too many false positives (>30%), increase confidence threshold or refine patterns
- If transcript excerpts are not aligning with timestamps, verify timestamp parsing logic
- After 35 iterations, if accuracy not improving, document current patterns and seek human feedback

## Self-Correction

- Test with diverse transcript samples: formal meetings, brainstorming sessions, quick syncs
- Verify confidence scores are calibrated: high-confidence items should be more accurate
- Check that 'Suggested' status is set in all code paths before database save
- Monitor false positive/negative rates in test data
- Ensure rejection reasons are being logged correctly for model improvement
