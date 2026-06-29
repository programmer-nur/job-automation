# AI_WORKFLOW.md — Agent Execution Workflow

## Mandatory Sequence

Every task **must** follow this exact sequence. No step may be skipped.

```
  1. Repository Review
  2. Context Collection
  3. Specification & Planning
  4. Design Review
  5. Implementation (TDD)
  6. Testing
  7. Review & Refactor
  8. Final Verification
  9. Ship
```

---

## 1. Repository Review

- Read `AGENTS.md`, `AI_WORKFLOW.md` (this file)
- Read/re-read relevant `docs/*.md`
- Read/re-read relevant `specs/feature/*.md`
- Understand the architecture before touching code

## 2. Context Collection

- Identify all files that need to change
- Read existing source code (never assume — search first)
- Check existing patterns, conventions, imports
- Identify side effects and dependencies

## 3. Specification & Planning

- Confirm what the task requires against the spec
- Break work into small, ordered steps
- Write a plan (in todo or comment) before writing code
- State assumptions and get implicit approval

## 4. Design Review

- Consider architecture, module boundaries, API contracts
- Check layer rules (routes → controller → service → repository)
- No layer violations, no circular deps, no surprise designs

## 5. Implementation (TDD)

- Write tests first (RED) → implement (GREEN) → refactor
- One step at a time. Keep changes small and focused.
- Match existing style, patterns, conventions exactly.
- Never invent APIs, tables, or abstractions.

## 6. Testing

- Run full test suite after every change
- Add new tests for new behavior
- Verify edge cases (null, empty, boundary, error paths)
- No regressions

## 7. Review & Refactor

- Self-review against AGENTS.md §17 checklist
- Check for dead code, duplication, unnecessary complexity
- Clean up. Leave code cleaner than you found it.

## 8. Final Verification

- Run full test suite one final time
- Run `npx tsc --noEmit` (typecheck)
- Run `npm run build`
- Confirm Definition of Done (AGENTS.md §19):
  - [ ] Implementation finished per spec
  - [ ] All tests pass
  - [ ] Typecheck passes
  - [ ] Build passes
  - [ ] Documentation updated (if needed)
  - [ ] No debug code, no TODO stubs

## 9. Ship

- Commit with Conventional Commit message
- Push to remote
- Mark tasks complete in todolist

---

## References

| Step | AGENTS.md Reference |
|------|---------------------|
| All  | §5 Development Workflow |
| All  | §20 AI Execution Checklist |
| 3    | `.opencode/skills/spec-driven-development/SKILL.md` |
| 3    | `.opencode/skills/planning-and-task-breakdown/SKILL.md` |
| 5    | `.opencode/skills/test-driven-development/SKILL.md` |
| 7    | `.opencode/skills/code-review-and-quality/SKILL.md` |
| 8    | §19 Definition of Done |
