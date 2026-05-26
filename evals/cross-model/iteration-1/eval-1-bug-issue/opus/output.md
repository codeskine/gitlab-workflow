# Draft — GitLab Issue (bug)

**Title:** `bug(api): nil pointer panic in handler when X-User-Id header is missing`

**Labels:** `type::bug`, `workflow::ready`

**Milestone:** _none_ (no active milestone matched `fix/87-nil-pointer`)

---

## Description

The HTTP handler in `pkg/api/handler.go` crashes with a nil pointer dereference panic
when a request is received without the `X-User-Id` header. The handler reads the header
into a local string variable and then passes it directly to `GetUser()` without checking
whether the value is empty. `GetUser()` returns `(nil, error)` for an unknown / empty ID,
but the handler ignores the returned error and immediately dereferences the `*User`
pointer to read `user.Name`, causing a `runtime error: invalid memory address or nil
pointer dereference` and a 500 response (after the panic is recovered by the server's
recovery middleware).

### 1. Missing header guard before `GetUser()` call

```go
// pkg/api/handler.go line 82-94
func (h *Handler) HandleGetUser(w http.ResponseWriter, r *http.Request) {
    userID := r.Header.Get("X-User-Id")
    // BUG: no validation — userID may be "" when the header is missing,
    // and the error returned by GetUser is ignored below.

    user, err := h.svc.GetUser(r.Context(), userID) // line 87
    if err != nil {
        h.log.Warn("GetUser failed", "err", err)
    }

    // PANIC: user is nil when userID == "" because GetUser returns (nil, ErrNotFound).
    w.Header().Set("Content-Type", "application/json")
    _ = json.NewEncoder(w).Encode(map[string]string{"name": user.Name})
}
```

### 2. Reproduction

```bash
curl -i http://localhost:8080/api/user
# HTTP/1.1 500 Internal Server Error
# server log: runtime error: invalid memory address or nil pointer dereference
#             goroutine N [running]:
#             .../pkg/api.(*Handler).HandleGetUser(...)
#                     pkg/api/handler.go:87 +0x...
```

Any request without the `X-User-Id` header (or with an empty value) triggers the panic.

---

## Impact

- Every unauthenticated request to `GET /api/user` crashes the request goroutine and
  returns 500 instead of a clean `400 Bad Request` or `401 Unauthorized`.
- Recovery middleware masks the root cause in production logs as a generic panic.
- Increases noise in error monitoring / alerting and may trigger false incident pages.
- No data corruption — the panic occurs before any write — but availability of the
  endpoint is effectively zero for clients that forget the header.

---

## Related issues

- Audit other handlers in `pkg/api/` for the same pattern (header read → call → deref
  without nil check).
- Consider extracting a small middleware that validates required headers up-front.

---

## Files affected

- `pkg/api/handler.go`

---

## Activities

- [ ] Validate `X-User-Id` at the top of `HandleGetUser` and return `400 Bad Request`
      when the header is missing or empty.
- [ ] Check the error returned by `GetUser()` before dereferencing `user`; return
      `404 Not Found` on `ErrNotFound` and `500` on unexpected errors.
- [ ] Sweep `pkg/api/` for other handlers ignoring `GetUser()` / similar errors.
- [ ] Add a regression unit test covering the missing-header case (expect 400, no panic).
- [ ] Add a unit test covering the unknown-user case (expect 404, no panic).
- [ ] Add / update unit tests.

---

## Draft gate

Draft ready. Shall I create the issue on GitLab with title
`bug(api): nil pointer panic in handler when X-User-Id header is missing`,
labels `type::bug,workflow::ready`, milestone `none`? (yes / changes / cancel)
