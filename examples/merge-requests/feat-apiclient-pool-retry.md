---
kind: mr
title: "feat(platform-scraper): introduce apiclient package with TCP pool, retry, and model types"
labels: "component: platform-scraper,performance,feat"
milestone: "v1.4.0"
status: published
gitlab_url: https://gitlab.example.com/acme/platform-scraper/-/merge_requests/49
published_at: 2026-06-04
created_at: 2026-06-04
---

## Summary

Resolves PERF-001, PERF-002, and PERF-003 in a single MR.

**PERF-001 / PERF-002** — Introduces the `app/apiclient/` package as the single HTTP entry point
toward the api-server, replacing the old `app/utils/httputils.go`. The client shares its TCP pool
for the whole process lifetime and retries automatically on transient errors (5xx, 408, 429,
502–504). The domain types `DataToSend[T]`, `Metadata`, `Inherited` move to `app/model/payload.go`.
The generic `sendPayload[T]` function centralizes enrichment, marshalling, and sending. All
scrapers are updated to receive the client via `Init`.

**PERF-003** — Removes the repeated `regexp.Compile` calls in `FilterMapByRegex`. The regex
patterns from `MetaExtraFields.Labels` and `MetaExtraFields.Annotations` are compiled once at
startup via `Cfg.Compile()` and stored as `[]*regexp.Regexp`. The `FilterMapByRegex` signature
changes from `[]string` to `[]*regexp.Regexp`; the 37 call-sites in the scrapers are updated
accordingly.

Total diff: 23 files.

---

## Changes

- `app/apiclient/client.go` — new package with the `Client` interface and the `RemoteClient` implementation

```go
// app/apiclient/client.go line 19
// Client defines the HTTP operations toward the pk-watch api-server.
type Client interface {
    PostJSON(ctx context.Context, url, apiKey string, body []byte) error
    Delete(ctx context.Context, url, apiKey string) error
    CloseIdleConnections()
}

// New builds a RemoteClient configured with TCP pool, OTel tracing, and the
// retry policy from cfg. Calls to /ping do not produce OTel spans.
func New(cfg *config.APIServerConfiguration) *RemoteClient {
    transport := &http.Transport{
        MaxIdleConns:        cfg.MaxIdleConns,
        MaxConnsPerHost:     cfg.MaxConnsPerHost,
        MaxIdleConnsPerHost: cfg.MaxIdleConnsPerHost,
    }
    otelTransport := otelhttp.NewTransport(transport,
        otelhttp.WithFilter(func(r *http.Request) bool { return r.URL.Path != "/ping" }),
    )
    rc := restyplus.NewWithClient(&http.Client{Transport: otelTransport})
    rc.SetTimeout(cfg.Timeout)
    rc.SetRetryCount(cfg.BackoffPolicy.MaxRetries)
    rc.SetRetryWaitTime(cfg.BackoffPolicy.RetryWaitTime)
    rc.SetRetryMaxWaitTime(cfg.BackoffPolicy.RetryMaxWaitTime)
    rc.AddRetryCondition(retryCondition)
    return &RemoteClient{client: rc}
}
```

- `app/scraper/publish.go` — generic `sendPayload[T]` helper with enrichment and marshalling

```go
// app/scraper/publish.go line 16
// sendPayload enriches meta, marshals body to JSON, and sends it via client.
// Returns false on nil body, marshal error, or transport failure after retries.
func sendPayload[T any](
    ctx context.Context,
    client apiclient.Client,
    url, apiKey string,
    body *model.DataToSend[T],
    clusterName string,
) bool {
    if body == nil {
        log.Error().Str("url", url).Msg("scraper: nil body")
        return false
    }
    if body.Meta.Kind == "" {
        body.Meta.Kind = utils.GetDataKind(body.Data)
    }
    body.Meta.LastScrape = time.Now()
    body.Meta.ClusterName = clusterName
    data, err := json.Marshal(body)
    if err != nil {
        log.Error().Err(err).Str("kind", body.Meta.Kind).Msg("scraper: marshal failed")
        return false
    }
    if err := client.PostJSON(ctx, url, apiKey, data); err != nil {
        log.Error().Err(err).Str("url", url).Str("kind", body.Meta.Kind).
            Msg("scraper: send failed")
        return false
    }
    return true
}
```

- `app/scraper/scraperController.go` — `Manager` owns the client; the `scraper` interface gains `ctx`

```go
// app/scraper/scraperController.go line 16
// Manager orchestrates all scrapers for a single execution cycle.
type Manager struct {
    cfg       *config.Cfg
    apiClient apiclient.Client
    scrapers  []scraper
}

// scraper is the internal interface implemented by each resource scraper.
type scraper interface {
    Init(cfg *config.Cfg, apiClient apiclient.Client) error
    Execute(ctx context.Context) error
}
```

- `app/utils/httputils.go` — **removed**: `DataToSend`, `Metadata`, `Inherited`, `PostRequestWithRetry`, `SendDeleteRequest` deleted
- `app/model/payload.go` — domain types moved here, with `MarshalJSON` rendering `LastScrape` in RFC 3339
- `app/config/model.go` / `defaults.go` — `APIServerConfiguration` extended with `Timeout`, `MaxIdleConns`, `MaxConnsPerHost`, `MaxIdleConnsPerHost`, `BackoffPolicy`

---

## Linked issues

- Closes #83
- Closes #84
- Closes #85
- Closes #44

---

## How to test

- [ ] `go build ./...` — no compilation errors
- [ ] `go test -race ./... -count=1` — all packages PASS, no DATA RACE
- [ ] `go test ./app/apiclient/... -v` — verify pool, retry on 5xx, context cancellation
- [ ] `go test ./app/scraper/... -v` — verify `sendPayload` and testify mocks
- [ ] `go test ./app/model/... -v` — verify `MarshalJSON` with RFC 3339 timestamps

---

## Author checklist

- [x] Tests added or updated (`app/apiclient/client_test.go`, `app/model/payload_test.go`, `app/scraper/publish_test.go`, `app/config/compile_test.go`, `app/utils/utils_test.go`)
- [x] Documentation updated (ADR 0002 in `docs/adr/`)
- [x] No undocumented breaking change — `app/utils/httputils.go` removed but all call-sites updated in this MR

---

## Reviewer notes

- The old `httputils.go` created an `http.Client` per request (no pool), exhausting TCP connections in environments with many namespaces. The new `RemoteClient` keeps connections alive for the whole process.
- `retryCondition` does not retry on generic 4xx (except 408 and 429) to avoid loops on authorization errors or malformed payloads.
- The `apiclient` tests use `httptest.NewServer` with no network mocking — the 5xx retry behavior is verified against a real in-process server.
- `sendPayload[T]` relies on Go 1.22 type inference; the explicit type argument was removed from all call-sites after a `gocritic/infertypeargs` lint warning.
- `FilterMapByRegex` receives pre-compiled `[]*regexp.Regexp`: with 100 namespaces and 12 resource types this removes ~2400 `regexp.Compile` calls per scrape cycle. The original `[]string` stay in config for YAML serialization and logging.
