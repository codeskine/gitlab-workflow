---
kind: issue
type: technical-debt
title: "[PERF-001] Reuse a single http.Client across all PostRequest calls"
labels: "type::technical-debt,workflow::ready,component: platform-scraper,to-do,Priority High"
milestone: "v1.4.0"
status: published
gitlab_url: https://gitlab.example.com/acme/platform-scraper/-/issues/83
published_at: 2026-06-03
created_at: 2026-06-03
---

## Description

The `getClient` function in `app/utils/httputils.go` is called on every HTTP request and returns
a brand-new `*http.Client` each time. It is invoked by both `PostRequest` and `SendDeleteRequest`,
which means every payload sent to the api-server allocates a new client with its own OTel
transport.

### Current code

**`getClient`** — `app/utils/httputils.go` lines 176–185:

```go
func getClient(timeout time.Duration) *http.Client {
    return &http.Client{
        Transport: otelhttp.NewTransport(http.DefaultTransport,
            otelhttp.WithFilter(func(r *http.Request) bool {
                return r.URL.Path != "/ping"
            }),
        ),
        Timeout: timeout,
    }
}
```

**Callers** — `app/utils/httputils.go` lines 138 and 212:

```go
// PostRequest (line 138):
resp, err := getClient(timeout).Do(req)

// SendDeleteRequest (line 212):
resp, err := getClient(timeout).Do(req)
```

Each invocation allocates a new `*http.Client` and a new `otelhttp.Transport`. The internal
`net/http` connection pool (which minimizes TCP handshake cost) is per-client: creating a new
client on every request means the pool is never reused and every request opens a new TCP
connection.

### Expected code

```go
// package-level, initialized once
var httpClient *http.Client

func initHTTPClient(timeout time.Duration) {
    httpClient = &http.Client{
        Transport: otelhttp.NewTransport(
            &http.Transport{ /* PERF-002 */ },
            otelhttp.WithFilter(func(r *http.Request) bool {
                return r.URL.Path != "/ping"
            }),
        ),
        Timeout: timeout,
    }
}
```

---

## Impact

For a cycle that sends ~500 resources, each scrape performs ~500 fresh `*http.Client` +
`*http.Transport` allocations plus transport-internal goroutines. The GC pressure is measurable
with `go tool pprof` (heap profile: high `alloc_objects` in `getClient`). Reusing the client
removes both the allocations and the repeated TCP handshake cost.

---

## Affected files

- `app/utils/httputils.go` — remove `getClient`, add `initHTTPClient` and a package-level `httpClient` variable

---

## Tasks

- [ ] Define `var httpClient *http.Client` at package level in `httputils.go`
- [ ] Add `InitHTTPClient(timeout time.Duration)` that initializes `httpClient` (depends on PERF-002 for the transport configuration)
- [ ] Remove the `getClient` function
- [ ] Replace `getClient(timeout).Do(req)` with `httpClient.Do(req)` in `PostRequest` and `SendDeleteRequest`
- [ ] Call `utils.InitHTTPClient(...)` in `main.go` before the loop starts
- [ ] `go test ./app/utils/... -count=1` with no regressions
- [ ] `golangci-lint run` with no additional errors
