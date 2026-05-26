# Notes — eval-9-implicit-trigger (opus)

## Did I trigger the skill?

**Yes.** I applied the `conventional-commit` skill.

## Why?

The user's message — "Ok, I'm done with the OAuth2 changes on feature/42-oauth. Everything looks good." — never uses the word "commit", but it carries two strong readiness signals:

1. "I'm done with the OAuth2 changes" → work is complete.
2. "Everything looks good" → user has reviewed and is ready to save progress.

The skill's description explicitly anticipates this:

> "Also triggers when the user says changes are done, work is complete, or signals readiness to save progress — even without explicitly saying 'commit'."

The branch name `feature/42-oauth` is also a textbook pattern the skill is built to parse (type `feat`, issue `#42`), reinforcing that this is a commit-authoring task.

## Was the description clear enough to trigger on "I'm done"?

Yes — the description is well-calibrated for this case. The explicit "done / complete / readiness to save progress" trigger clause is the deciding factor; without it, a strict reading of "Use when the user asks to create a commit" would have left the trigger ambiguous and risked a miss. The disclaimer also helpfully scopes away merge-request and issue-creation cases, which the message could otherwise pattern-match (it mentions a feature branch).

One subtle risk: "Everything looks good" alone (without "I'm done") could read as casual approval rather than commit intent. The skill's description handles this fine when combined with the "done" cue, but for an isolated "looks good" the trigger would be weaker — acceptable behavior.

## Workflow adherence

- Stopped at the draft gate, did not execute `git commit` (per test-environment rule).
- Parsed branch → `feat` + `#42`.
- Picked scope `auth` from the most-changed path (`src/auth/oauth.go`, 45 lines).
- Used `Closes #42` because the branch prefix is `feat` and the work appears to resolve the issue.
- Asked the standard confirmation question: "yes / edit / cancel".
