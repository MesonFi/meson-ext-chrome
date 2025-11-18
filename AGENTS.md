# AGENTS.md

## Overall Workflow

This project follows a four-phase development cycle:

1. **DESIGN**
   Understand the requirement, study the existing project, and produce a technical design.
   Refine the requirement text where needed, but do not change code or documentation.

2. **DEVELOPMENT**
   Implement the approved design.
   Update `src/**` and, when needed, `docs/**` to stay aligned with the implementation.

3. **ADJUST**
   Apply small fixes and refinements based on `03_adjustments.md`.
   Adjust code and relevant documentation within the existing scope.

4. **FINISH**
   Archive the requirement cycle, prepare a clean commit, and set up a new empty requirement file.

Each phase has its own instructions and allowed operations.
The AI must always act strictly within the current phase.

---

## General Guidelines

* **Follow phase rules exactly.**
  Only perform actions allowed in the active phase and avoid tasks belonging to other phases.

* **Respect file boundaries.**
  Some files or folders are read-only in certain phases. Never modify them unless explicitly permitted.

* **Maintain consistency.**
  Requirements, design, code, and documentation must always remain aligned at a high level.

* **Preserve intent.**
  When editing requirement or documentation files (in allowed phases), improve clarity and structure without altering meaning or scope.

* **Keep changes minimal and relevant.**
  Avoid unnecessary rewrites, refactors, or scope expansion.

* **Do not hallucinate.**
  Use only existing project files, APIs, and structures. If something is missing or unclear, note it instead of inventing details.

* **Communicate uncertainties.**
  When an issue requires human confirmation, explicitly write it in the appropriate file (e.g., in `03_adjustments.md` during ADJUST).

* **Produce clean, structured output.**
  Keep patches focused, readable, and easy to review.

* **No `git push`.**
  Only create local commits when the phase requires it.

