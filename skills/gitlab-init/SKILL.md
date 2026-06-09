---
name: gitlab-init
description:
  "GitLab project initializer. Use when the user asks to initialize a GitLab
  project with the required labels (workflow::*, type::*, kind::*), or says 'setup
  GitLab', 'init GitLab project', 'configure labels', 'initialize project labels'."
user-invocable: true
license: MIT
compatibility: "Designed for Claude Code or similar AI coding agents. Requires glab CLI authenticated."
metadata:
  author: codeskine
  version: "1.0.1"
allowed-tools: Read Bash(glab:*) Bash(bash:*)
---

# GitLab init — project label initializer

Initialize the 10 GitLab labels required by the `gitlab-workflow` plugin in the current project.
Labels already present are silently skipped — safe to run on any project, any number of times.

## Workflow

### 1. Announce intent

Tell the user:

> "I will create up to 10 GitLab labels in the current project (`workflow::*`, `type::*`, `kind::*`).
> Labels that already exist will be skipped.
>
> Confirm: run label setup? (yes / cancel)"

Wait for explicit confirmation. If the user says cancel or no, stop.

### 2. Run the setup script

The skill base directory is provided in your context as "Base directory for this skill:".
Execute the setup script from that directory:

```bash
bash "<base_dir>/scripts/setup-labels.sh"
```

Replace `<base_dir>` with the actual base directory path shown in your context.

### 3. Present results

Show the script output as-is. Then summarize:

> "Setup complete. Created: N label(s). Already present: M label(s)."

Where N and M are derived from counting `created` and `skip` lines in the output.
