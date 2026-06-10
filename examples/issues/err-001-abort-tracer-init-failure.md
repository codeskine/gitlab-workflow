---
kind: issue
type: bug
title: "[ERR-001] Abort startup when tracer initialization fails"
labels: "type::bug,error-handling,workflow::ready,component: platform-scraper,Priority High"
milestone: "v1.4.0"
status: published
gitlab_url: https://gitlab.example.com/acme/platform-scraper/-/issues/77
published_at: 2026-06-03
created_at: 2026-06-03
---

## Description

### `initTracer` error ignored — execution continues with a broken tracer

`main.go` logs the `initTracer` error but keeps running:

```go
// main.go line 50-53
tracerShutdown, err := initTracer(ctx)
if err != nil {
    log.Error().Err(err).Msg("Main: Error in initializing tracer")
    // missing os.Exit(1) — execution continues
}
```

The code below checks `tracerShutdown != nil` before calling it (line 71), but `tracerShutdown`
is nil when `initTracer` fails: the whole scrape session emits empty/disconnected spans to the
OTel collector for the entire run.

---

## Steps to reproduce

1. Configure an unreachable or invalid OTel endpoint.
2. Start `platform-scraper`.
3. Observe: the process starts, scrapes data, and publishes it with no traces.

---

## Expected behavior

`initTracer` fails → log the error wrapped with context → `os.Exit(1)`.

---

## Actual behavior

The process starts normally with tracing broken, producing an entire untraced scrape cycle with
no operational signal.

---

## Impact

The operator gets no signal that tracing is broken: the OTel dashboard shows trace gaps with no
alert. The problem can go unnoticed for several cycles.

---

## Related issues

- Epic: [#66 — ERR Error Handling Consistency](https://gitlab.example.com/acme/platform-scraper/-/issues/66)

---

## Affected files

- `main.go` — lines 50–53

---

## Tasks

- [ ] Add `os.Exit(1)` after the error log in the `initTracer` failure branch
- [ ] Wrap the error with `fmt.Errorf("initializing tracer: %w", err)` before logging
- [ ] Remove the nil-check on `tracerShutdown` (line 71): after the fix, `tracerShutdown` is always valid if execution reaches that point
- [ ] `golangci-lint run` with no additional errors
