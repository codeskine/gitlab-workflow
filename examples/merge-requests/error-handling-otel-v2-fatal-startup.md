---
kind: mr
title: "fix(platform-scraper): error-handling consistency — OTel v2, fatal startup, publish error propagation"
labels: "fix,component: platform-scraper,error-handling,observability,to-merge"
milestone: "v1.4.0"
status: published
created_at: 2026-06-09
published_at: 2026-06-09
gitlab_url: https://gitlab.example.com/acme/platform-scraper/-/merge_requests/54
---

## Summary

This MR closes three issues from the ERR Error Handling Consistency epic (#66):

- **#77 [ERR-001]** — `initTracer` failure is now fatal (`os.Exit(1)`); the tracer is encapsulated in the new `app/observability` package with typed sentinel errors and dedicated tests.
- **#96 [ERR-002]** — `time.LoadLocation` failure now uses zerolog and fails startup, with explicit UTC as the documented fallback.
- **#78 [ERR-003]** — `sendPayload` returns `error` instead of `bool`; all scrapers accumulate publish failures with `errors.Join` (best-effort loop) and propagate them up to `Execute`.

The branch also includes the migration to `observability/otel/v2` (required by #77), fixes to mock
signatures and testifylint violations, and two ADRs: ADR-0003 (marked Accepted) and the new
ADR-0004 on error propagation in `scraper.Execute`.

---

## Changes

- `app/observability/errors.go`: new sentinel errors `ErrTracerInit` and `ErrTracerShutdown`

```go
// app/observability/errors.go line 1-9
package observability

import "errors"

// ErrTracerInit is returned when the global TracerProvider cannot be initialized.
var ErrTracerInit = errors.New("tracer initialization failed")

// ErrTracerShutdown is returned when the TracerProvider fails to flush and shut down.
var ErrTracerShutdown = errors.New("tracer shutdown failed")
```

- `app/observability/tracing.go`: `InitTracer` and `ShutdownTracer` extract the logic from `main` and wrap errors with the sentinels

```go
// app/observability/tracing.go line 18-40
func InitTracer(ctx context.Context) (*traces.Provider, error) {
	tp, err := traces.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrTracerInit, err)
	}
	log.Debug().Msg("observability: tracer provider initialized")
	return tp, nil
}

func ShutdownTracer(shutdown TracerShutdown, timeout time.Duration) error {
	log.Info().Msg("observability::Tracer: shutdown initiated")
	sdCtx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	if err := shutdown(sdCtx); err != nil {
		log.Error().Err(err).Msg("observability::Tracer: shutdown failed")
		return fmt.Errorf("%w: %w", ErrTracerShutdown, err)
	}
	log.Info().Msg("observability::Tracer: shutdown completed")
	return nil
}
```

- `app/scraper/publish.go`: `sendPayload` signature changes from `bool` to `error`; log downgraded from `Error` to `Warn` (per-resource failures are recoverable)

```go
// app/scraper/publish.go line 13-50
// sendPayload enriches meta, marshals body to JSON, and sends it via client.
// Returns nil on success, or the error on nil body, marshal failure, or transport
// failure after retries. Per-resource failures are logged at Warn: they are
// recoverable and the caller aggregates them with errors.Join.
func sendPayload[T any](
	ctx context.Context,
	client apiclient.Client,
	url, apiKey string,
	body *model.DataToSend[T],
	clusterName string,
) error {
	if body == nil {
		err := fmt.Errorf("send %s: nil body", url)
		log.Warn().Str("url", url).Msg("scraper: nil body")
		return err
	}
	// ...
	if err := client.PostJSON(ctx, url, apiKey, data); err != nil {
		log.Warn().Err(err).Str("url", url).Str("kind", body.Meta.Kind).
			Msg("scraper: send failed")
		return err
	}
	return nil
}
```

- `docs/adr/0004-publish-error-propagation-in-scraper-execute.md`: new ADR-0004 — documents the decision to change `sendPayload` from `bool` to `error` and the `errors.Join` pattern in the best-effort loop; includes the analysis of the 18 `_ = sendPayload(...)` sites and the 13 `_ = executeXxx(...)` sites originally present

- `docs/adr/README.md`: ADR-0004 added to the index

- `app/scraper/scraperNamespaces.go`: best-effort loop — every namespace-resource scraper always runs; failures accumulate with `errors.Join`

```go
// app/scraper/scraperNamespaces.go line 56-100 (excerpt)
func (s *scraperNamespaces) Execute(ctx context.Context) error {
	namespaces, err := executeNamespaces(ctx, s.cfg, s.k8sClient, s.apiClient, s.labelsFilter, s.annotationsFilter)
	if namespaces == nil {
		return err
	}
	errs := err

	for i := range namespaces {
		nsMeta := extractLabelsAndAnnotation(&namespaces[i], s.labelsFilter, s.annotationsFilter)

		if slices.Contains(s.cfg.Scraper.ObjectsToScrape.Kinds, "Deployment") {
			errs = errors.Join(errs, executeDeployments(
				ctx, namespaces[i].Name, s.cfg, s.k8sClient, s.apiClient,
				nsMeta, s.labelsFilter, s.annotationsFilter,
			))
		}
		// ... same structure for every other kind ...
	}
	return errs
}
```

---

## Linked issues

- Closes #77
- Closes #78
- Closes #96

---

## How to test

- [ ] `go test ./...` from `scrapers/platform-scraper/` — all tests must pass
- [ ] `golangci-lint run` with no new violations
- [ ] Verify that with an unreachable OTel endpoint the process exits with code 1 and a structured error log
- [ ] Verify that with `TZ=Invalid/Zone` the process exits with code 1 and a zerolog error
- [ ] Verify that an unreachable API server produces non-nil errors propagated into the end-of-cycle log

---

## Author checklist

- [x] Tests added/updated (`app/observability/tracing_test.go`, mock updates in scraper tests)
- [x] ADR-0003 marked Accepted (`docs/adr/0003-...`)
- [x] ADR-0004 added (`docs/adr/0004-publish-error-propagation-in-scraper-execute.md`)
- [x] ADR index updated (`docs/adr/README.md`)
- [x] No undocumented breaking change — the `sendPayload` signature is internal to the `scraper` package

---

## Reviewer notes

**`sendPayload` — from `bool` to `error`**: the function is `unexported`; all call-sites are in the
`scraper` package. The signature change has no public impact.

**Best-effort loop in `scraperNamespaces.Execute`**: the guard `if namespaces == nil` (rather than
`!= nil`) is intentional — if `executeNamespaces` returns both partial errors and a non-nil list
(e.g. a timeout on a subset), the loop continues and accumulates all failures. The errors are then
propagated at the end of the loop.

**`context.Background()` in `ShutdownTracer`**: required because at shutdown time the process
context is already cancelled; a fresh context with a timeout is the only way to export in-flight
spans.
