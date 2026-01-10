# PRD to Ralph JSON Converter

Convert Product Requirements Documents (PRDs) into Ralph Wiggum-compatible JSON files containing well-structured user stories optimized for iterative AI development loops.

## What is Ralph Wiggum?

Ralph Wiggum is an iterative development methodology where the same prompt is fed to an AI agent repeatedly. The agent sees its own previous work in files and git history, enabling self-referential improvement until task completion. User stories should be structured as high-quality prompts with clear completion criteria.

## JSON Schema for Ralph User Stories

Generate a JSON file following this schema:

```json
{
  "$schema": "ralph-user-stories-v1",
  "metadata": {
    "prd_title": "string - Name of the source PRD",
    "generated_at": "ISO 8601 timestamp",
    "total_stories": "number",
    "phases": ["array of phase names/numbers"]
  },
  "user_stories": [
    {
      "id": "string - Unique identifier (e.g., US-001)",
      "title": "string - Concise, descriptive title",
      "phase": "number or string - Implementation phase",
      "priority": "MUST | SHOULD | COULD | WONT",
      "persona": "string - Target user persona",

      "prompt": {
        "task_description": "string - Clear, actionable task statement",
        "context": "string - Background and rationale",
        "requirements": [
          {
            "id": "string - Requirement ID (e.g., REQ-001)",
            "description": "string - What needs to be done",
            "acceptance_criteria": "string - Given/When/Then format",
            "testable": "boolean - Can be automatically verified",
            "completed": false
          }
        ],
        "technical_specifications": [
          "string - Technical constraints and guidelines"
        ],
        "files_to_create_or_modify": [
          "string - Expected file paths"
        ],
        "dependencies": [
          "string - IDs of prerequisite user stories"
        ]
      },

      "success_criteria": {
        "definition_of_done": [
          "string - Measurable completion conditions"
        ],
        "verification_commands": [
          "string - Commands to verify completion (tests, linters, etc.)"
        ],
        "completion_promise": "string - Unique promise tag for this story"
      },

      "iteration_guidance": {
        "max_iterations": "number - Suggested iteration limit",
        "escape_conditions": [
          "string - What to do if stuck"
        ],
        "self_correction_hints": [
          "string - How to debug and fix issues"
        ]
      }
    }
  ]
}
```

## Conversion Process

When converting a PRD to Ralph JSON, follow these steps:

### Step 1: Extract User Stories

1. Locate all user stories in the PRD (typically in "User Stories and Requirements" section)
2. Parse the "As a... I want... So that..." format
3. Extract acceptance criteria (Given/When/Then statements)
4. Identify technical notes and constraints

### Step 2: Structure as Prompts

Transform each user story into a well-structured prompt by:

1. **Task Description**: Convert the user story into an imperative task statement
   - BAD: "As a user, I want to log in"
   - GOOD: "Implement user authentication with login functionality"

2. **Requirements as Checkboxes**: Each acceptance criterion becomes a trackable requirement
   ```
   - [ ] Requirement description
   ```

3. **Clear Completion Criteria**: Define what "done" looks like
   - Specify tests that must pass
   - Define coverage thresholds
   - List files that must exist

4. **Completion Promise**: Create a unique, descriptive promise tag
   - Format: `<promise>{STORY_ID}_COMPLETE</promise>`
   - Example: `<promise>US_001_TRANSCRIPT_GENERATION_COMPLETE</promise>`

### Step 3: Add Iteration Guidance

For each story, include:

1. **Max Iterations**: Based on complexity
   - Simple (1-2 files): 10-20 iterations
   - Medium (3-5 files): 20-50 iterations
   - Complex (5+ files): 50-100 iterations

2. **Self-Correction Hints**:
   ```
   - Run tests after each change
   - Check linter output
   - Verify type safety
   - Review error messages in logs
   ```

3. **Escape Conditions**:
   ```
   - If blocked for 5+ iterations, document the blocker
   - If tests fail repeatedly, isolate the failing test
   - If dependencies are missing, list them and pause
   ```

## Prompt Writing Best Practices

### DO:

1. **Be Specific and Measurable**
   ```
   GOOD: "Create /src/auth/login.ts with loginUser() function that accepts email/password and returns JWT token"
   BAD: "Add login functionality"
   ```

2. **Include Verification Commands**
   ```json
   "verification_commands": [
     "npm run test -- --testPathPattern=auth",
     "npm run lint",
     "npm run typecheck"
   ]
   ```

3. **Define File Structure**
   ```json
   "files_to_create_or_modify": [
     "src/auth/login.ts",
     "src/auth/login.test.ts",
     "src/types/auth.ts"
   ]
   ```

4. **Use TDD Approach**
   ```
   1. Write failing tests first
   2. Implement feature
   3. Run tests
   4. If any fail, debug and fix
   5. Refactor if needed
   6. Repeat until all green
   ```

5. **Provide Context**
   ```
   This component integrates with the existing AuthService in /src/services/auth.ts.
   Follow the existing error handling patterns in /src/utils/errors.ts.
   ```

### DON'T:

1. **Vague Success Criteria**
   ```
   BAD: "Make it work well"
   GOOD: "All 15 unit tests pass with >80% code coverage"
   ```

2. **Missing Dependencies**
   ```
   BAD: "Implement the dashboard" (when auth isn't done)
   GOOD: "Implement the dashboard. Depends on: US-001 (Auth), US-002 (User Model)"
   ```

3. **Unbounded Scope**
   ```
   BAD: "Build a complete e-commerce platform"
   GOOD: "Phase 1: User registration with email verification"
   ```

## Example Conversion

### Input (from PRD):

```
#### US-001: Automatic Transcript Generation

As an Executive
I want meeting transcripts to be automatically generated
So that I do not need to rely on manual note-taking or memory

Acceptance Criteria:
- Given a Teams meeting with recording enabled, when the meeting ends, then a transcript is generated within 30 minutes
- Given a meeting with multiple speakers, when the transcript is generated, then speakers are correctly identified
- Given poor audio quality, when transcription fails, then the system notifies the meeting organizer

Technical Notes:
- Leverage Microsoft Teams native transcription
- Store transcripts in designated SharePoint location with appropriate permissions
```

### Output (Ralph JSON):

```json
{
  "id": "US-001",
  "title": "Automatic Transcript Generation",
  "phase": 1,
  "priority": "MUST",
  "persona": "Executive",

  "prompt": {
    "task_description": "Implement automatic transcript generation for Teams meetings using Microsoft Teams native transcription. Store transcripts in SharePoint with appropriate permissions.",

    "context": "Executives need meeting transcripts automatically generated to eliminate reliance on manual note-taking. This is the foundation for AI-assisted decision extraction in later phases.",

    "requirements": [
      {
        "id": "REQ-001",
        "description": "Generate transcript within 30 minutes after meeting ends",
        "acceptance_criteria": "Given a Teams meeting with recording enabled, when the meeting ends, then a transcript is generated within 30 minutes",
        "testable": true,
        "completed": false
      },
      {
        "id": "REQ-002",
        "description": "Correctly identify speakers in transcript",
        "acceptance_criteria": "Given a meeting with multiple speakers, when the transcript is generated, then speakers are correctly identified with >90% accuracy",
        "testable": true,
        "completed": false
      },
      {
        "id": "REQ-003",
        "description": "Handle transcription failures gracefully",
        "acceptance_criteria": "Given poor audio quality, when transcription fails, then the system notifies the meeting organizer via Teams notification",
        "testable": true,
        "completed": false
      }
    ],

    "technical_specifications": [
      "Use Microsoft Teams Graph API for transcription triggers",
      "Store transcripts in SharePoint document library: /sites/ExecutiveDecisions/Transcripts",
      "Implement retry logic with exponential backoff (3 attempts)",
      "Log all transcription events for audit trail"
    ],

    "files_to_create_or_modify": [
      "src/services/transcription/TranscriptionService.ts",
      "src/services/transcription/TranscriptionService.test.ts",
      "src/integrations/teams/TeamsWebhookHandler.ts",
      "src/integrations/sharepoint/TranscriptStorage.ts",
      "src/types/transcription.ts"
    ],

    "dependencies": []
  },

  "success_criteria": {
    "definition_of_done": [
      "TranscriptionService class implemented with start/stop/status methods",
      "Teams webhook successfully triggers transcription process",
      "Transcripts stored in SharePoint with correct metadata",
      "Error notification sent to organizer on failure",
      "All unit tests pass",
      "Integration test with mock Teams API succeeds"
    ],
    "verification_commands": [
      "npm run test -- --testPathPattern=transcription",
      "npm run test:integration -- --testPathPattern=teams",
      "npm run lint",
      "npm run typecheck"
    ],
    "completion_promise": "US_001_TRANSCRIPT_GENERATION_COMPLETE"
  },

  "iteration_guidance": {
    "max_iterations": 30,
    "escape_conditions": [
      "If Teams API authentication fails after 5 attempts, document required permissions and pause",
      "If SharePoint storage fails, verify site URL and permissions",
      "After 20 iterations without progress, create detailed blocker report"
    ],
    "self_correction_hints": [
      "Run tests after each change: npm run test",
      "Check Teams API response codes for debugging",
      "Verify SharePoint permissions in Azure AD app registration",
      "Review transcription logs in /logs/transcription.log"
    ]
  }
}
```

## Usage

To convert a PRD to Ralph JSON:

1. **Read the PRD** from the specified path
2. **Parse all user stories** following the schema above
3. **Generate JSON file** at: `docs/ralph/{prd-name}-user-stories.json`
4. **Optionally generate individual prompt files** at: `docs/ralph/prompts/{story-id}.md`

### Individual Prompt File Format

For each user story, optionally create a markdown prompt file:

```markdown
# {Story Title}

## Task

{task_description}

## Context

{context}

## Requirements

- [ ] {requirement_1}
- [ ] {requirement_2}
- [ ] {requirement_3}

## Technical Specifications

{technical_specifications as bullet list}

## Files to Create/Modify

{files_to_create_or_modify as bullet list}

## Success Criteria

When complete:
{definition_of_done as bullet list}

## Verification

Run these commands to verify completion:
```bash
{verification_commands}
```

## Completion

Output `<promise>{completion_promise}</promise>` when ALL of the following are true:
- All requirements checked off
- All tests pass
- All files created/modified as specified

## If Stuck

{escape_conditions as bullet list}

## Self-Correction

{self_correction_hints as bullet list}
```

## Command

When user requests PRD conversion:

1. Read the PRD file
2. Extract metadata (title, phases, total stories)
3. Parse each user story section
4. Transform into Ralph JSON format
5. Save to `docs/ralph/{prd-name}-user-stories.json`
6. Optionally create individual `.md` prompt files
7. Report summary of converted stories
