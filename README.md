# Setting Up the Ralph Wiggum AI Agent with Claude Code

This repository documents the step-by-step setup of the [Ralph Wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum) iterative AI development methodology with Claude Code.

Ralph Wiggum is a self-referential AI loop where Claude Code repeatedly receives the same prompt, sees its previous work in files and git history, and iteratively improves until completion. [Learn more about the technique](https://ghuntley.com/ralph/).

---

## Step 1: Enable the Ralph Wiggum Plugin

Claude Code supports plugins from [plugin marketplaces](https://code.claude.com/docs/en/discover-plugins) — GitHub repositories that host collections of plugins. The Ralph Wiggum plugin is available from the official Anthropic marketplace.

### Option A: Interactive Installation

Use the `/plugin` command inside Claude Code:

```bash
# Add the official Anthropic marketplace
/plugin marketplace add anthropics/claude-code

# Browse and install plugins
/plugin
```

Select `ralph-wiggum` from the plugin list to install it.

### Option B: Configuration File (Recommended for Teams)

Create `.claude/settings.json` in your repository to automatically enable plugins when the project is trusted:

```json
{
  "enabledPlugins": {
    "ralph-wiggum@claude-code-plugins": true
  }
}
```

The format is `plugin-name@marketplace-name`:
- `ralph-wiggum` — the plugin name
- `claude-code-plugins` — the marketplace identifier for `anthropics/claude-code`

### Adding Custom Marketplaces

To use plugins from other marketplaces, add them to `extraKnownMarketplaces`:

```json
{
  "extraKnownMarketplaces": {
    "my-marketplace": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "ralph-wiggum@claude-code-plugins": true,
    "custom-plugin@my-marketplace": true
  }
}
```

Once configured, team members will be prompted to install the marketplace when they trust the project folder.

### Verify Installation

After enabling the plugin, you should have access to:
- `/ralph-loop` — Start an iterative development loop
- `/cancel-ralph` — Cancel an active loop
- `/help` — View available commands (includes Ralph commands)

---

## Step 2: Configure Local Permissions

Create `.claude/settings.local.json` for automated tool permissions (this file is gitignored):

```json
{
  "permissions": {
    "allow": [
      "Bash(pytest:*)",
      "Bash(uv venv:*)",
      "Bash(uv pip install:*)",
      "Bash(black:*)"
    ]
  }
}
```

This allows Ralph loops to run tests and linters without prompting for permission on each iteration.

---

## Step 3: Create the PRD-to-Ralph Skill

Create `.claude/skills/ralph/SKILL.md` to convert Product Requirements Documents into Ralph-compatible prompts.

This skill:
- Reads a PRD and extracts user stories
- Transforms each user story into a structured prompt with:
  - Clear task description
  - Checkbox requirements
  - Technical specifications
  - Verification commands
  - Completion promise (e.g., `<promise>US_001_COMPLETE</promise>`)
  - Self-correction hints and escape conditions

See the full skill definition in [`.claude/skills/ralph/SKILL.md`](.claude/skills/ralph/SKILL.md).

---

## Step 4: Create Supporting Agents (Optional)

Create custom Claude Code subagents for specialized tasks in `.claude/agents/`.

This repository includes an **AI Product Manager** agent for creating PRDs and technical specifications:

```
.claude/agents/ai-product-manager.md
```

Agents are invoked automatically by Claude Code when tasks match their description.

---

## Step 5: Create Your PRD

Write a Product Requirements Document with structured user stories. The PRD should include:

- User stories in "As a... I want... So that..." format
- Acceptance criteria using Given/When/Then
- Technical notes and constraints

Example location: `docs/prds/executive-support-system/executive-support-system-prd.md`

---

## Step 6: Generate Ralph Prompts

Use Claude Code with the `/ralph` skill to convert your PRD into prompt files:

1. Invoke the skill with your PRD path
2. The skill generates:
   - Individual prompt files in `prompts/` directory
   - A JSON manifest with all user stories

Generated files follow this naming convention:
```
prompts/US-001-feature-name.md
prompts/US-002-another-feature.md
...
```

---

## Step 7: Run Ralph Loops

Execute each prompt as a Ralph loop:

```bash
/ralph-loop "@prompts/US-001-transcript-generation.md" --completion-promise "US_001_TRANSCRIPT_GENERATION_COMPLETE" --max-iterations 30
```

Claude Code will:
1. Read the prompt file
2. Work on implementing the requirements
3. Run verification commands (tests, linters)
4. Iterate until all tests pass and requirements are met
5. Output the completion promise when done

---

## Directory Structure

```
.
├── .claude/
│   ├── settings.json           # Plugin configuration (committed)
│   ├── settings.local.json     # Local permissions (gitignored)
│   ├── ralph-loop.local.md     # Active loop state (gitignored)
│   ├── skills/
│   │   └── ralph/
│   │       └── SKILL.md        # PRD-to-Ralph converter
│   └── agents/
│       └── ai-product-manager.md
├── docs/
│   └── prds/                   # Product Requirements Documents
├── prompts/                    # Generated Ralph prompts
│   ├── US-001-*.md
│   ├── US-002-*.md
│   └── ...
└── src/                        # Implementation code
```

---

## Managing Active Loops

### Check loop status

The active loop state is tracked in `.claude/ralph-loop.local.md`:

```yaml
---
active: true
iteration: 4
max_iterations: 15
completion_promise: "*COMPLETE"
started_at: "2026-01-10T12:19:21Z"
---

@prompts/US-001-transcript-generation.md
```

### Cancel a loop

```bash
/cancel-ralph
```

---

## Tips for Writing Effective Prompts

1. **Make requirements checkable** — Use `- [ ]` checkboxes
2. **Include verification commands** — `pytest`, `ruff`, `mypy`
3. **Set realistic iteration limits** — 20-50 for medium complexity
4. **Define escape conditions** — What to do if stuck
5. **Use unique completion promises** — One per user story

---

## Resources

- [Claude Code Plugin Documentation](https://code.claude.com/docs/en/discover-plugins)
- [Ralph Wiggum Plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [Original Ralph Technique by Geoffrey Huntley](https://ghuntley.com/ralph/)
- [VentureBeat: Ralph Wiggum in AI](https://venturebeat.com/technology/how-ralph-wiggum-went-from-the-simpsons-to-the-biggest-name-in-ai-right-now)
- [Ralph Orchestrator](https://github.com/mikeyobrien/ralph-orchestrator)
