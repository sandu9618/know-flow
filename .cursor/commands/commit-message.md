Generate a commit message for the currently staged changes.

Steps:
1. Run `git diff --staged` (or `git diff --staged --stat` first if the diff is
   very large) to see the actual changes. If nothing is staged, run
   `git status` and tell me what's unstaged instead of guessing.
2. Apply the conventions in
   `.cursor/rules/commit-message-generation.mdc`:
   - Conventional Commits format: `type(scope): summary`
   - Imperative mood, no trailing period, summary ≤ 72 chars
   - Pick scope from the actual layer touched (repositories, grading, auth,
     api/admin, middleware, etc.)
   - Add a body only if the "why" isn't obvious from the summary
   - If the diff touches tenant-scoping, auth, RBAC, or session logic, use
     `fix(security):` / `fix(auth):` and name the vulnerability class closed
   - If the diff spans multiple unrelated concerns, say so and propose
     splitting into separate commits instead of writing one message that
     covers both
3. Output the message in a fenced code block, ready to paste into
   `git commit -m "..."`.
4. Do not run `git commit` yourself — show me the message and let me commit
   it.
