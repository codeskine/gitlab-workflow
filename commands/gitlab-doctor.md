---
description: "GitLab environment health check — verify the glab CLI is installed and authenticated (and guide install/login if not). Run before any GitLab workflow skill."
argument-hint: "[hostname]"
allowed-tools: Bash(glab:*) Bash(command:*)
---

# gitlab-doctor

Get the `glab` CLI ready for the GitLab workflow skills (`gitlab-plan`, `gitlab-track`,
`gitlab-story`, `gitlab-review`, `gitlab-commit`). This command only **inspects** state; it
never runs the interactive `glab auth login` for the user — it tells them what to run.

If `$1` is provided, treat it as the target GitLab host (self-managed instance). Otherwise
default to `gitlab.com`.

## Usage

```text
/gitlab-doctor              Check the default host (gitlab.com)
/gitlab-doctor <hostname>   Check a self-managed instance (e.g. gitlab.example.com)
/gitlab-doctor help         Show this help and exit
```

**If `$1` is `help`, `-h`, or `--help`:** print the Usage block above and stop — do not run the
check below.

## Step 1 — Inspect the environment

Run this single block and report its output verbatim. Read the exit code.

```bash
{
  if ! command -v glab >/dev/null 2>&1; then
    echo "❌ glab is NOT installed."
    echo "   macOS:        brew install glab"
    echo "   Linux:        see https://gitlab.com/gitlab-org/cli#installation"
    echo "   Windows:      scoop install glab   (or)   winget install glab.glab"
    exit 1
  fi
  echo "✅ glab installed — $(glab --version | head -1)"

  if glab auth status >/dev/null 2>&1; then
    echo "✅ Authenticated."
    glab auth status 2>&1 | sed 's/^/   /'
  else
    echo "❌ NOT authenticated (missing or invalid token)."
    glab auth status 2>&1 | sed 's/^/   /'
    exit 2
  fi
}
```

## Step 2 — Act on the result

- **Exit 0** — installed and authenticated. Report "GitLab setup ready ✅" and stop.
- **Exit 1** — not installed. Relay the OS-specific install hint; do not run any other `glab`
  command. Once installed, ask the user to re-run this command.
- **Exit 2** — installed but not authenticated. Ask the user to run the login themselves
  (it is interactive — do not run it for them):

  ```bash
  glab auth login                 # for gitlab.com
  glab auth login --hostname $1   # for a self-managed host (when $1 was provided)
  ```

  After they log in, ask them to re-run this command to confirm.

## Troubleshooting

| Symptom                      | Cause                                | Fix                                            |
| ---------------------------- | ------------------------------------ | ---------------------------------------------- |
| `401 Unauthorized`           | missing/expired token                | `glab auth login` (re-authenticate)            |
| `context deadline exceeded`  | host unreachable (VPN, self-managed) | check network/VPN, verify the `--hostname`     |
| `glab: command not found`    | CLI not installed or not on `PATH`   | install glab; confirm with `command -v glab`   |
| `403 Forbidden` on a project | insufficient GitLab permissions      | request access / a token with the right scopes |
