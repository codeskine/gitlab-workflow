# Nil pointer panic in handler.go when user_id header is missing

## Description

A nil pointer dereference occurs in `pkg/api/handler.go` when the `user_id` request header is not present. The handler calls `GetUser()` without validating that the required header exists first, causing a panic on line 87.

### Reproduction

When a request reaches the HTTP handler without a `user_id` header:

```go
// pkg/api/handler.go line 82-90
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    userID := r.Header.Get("user_id")
    // BUG: no nil check before dereferencing
    user := h.GetUser(userID)  // panic if userID is empty string/nil
    
    if user.ID == 0 {          // line 87: nil pointer dereference
        http.Error(w, "Invalid user", http.StatusBadRequest)
        return
    }
}
```

The `GetUser()` method returns a `*User` pointer that is nil when the header is missing, but the handler accesses fields on it immediately without checking.

---

## Impact

- **Severity**: High — affects all requests that omit the `user_id` header
- **Affected endpoints**: All handlers in `pkg/api/handler.go`
- **Current behavior**: Application panics and crashes with `runtime error: invalid memory address or nil pointer dereference`
- **Expected behavior**: Handler should return `400 Bad Request` or `401 Unauthorized` when the header is missing

---

## Related issues

- None currently linked

---

## Files affected

- `pkg/api/handler.go`
- `pkg/api/user.go` (GetUser method)

---

## Activities

- [ ] Add validation for `user_id` header presence in the handler before calling `GetUser()`
- [ ] Add test case for missing `user_id` header
- [ ] Add test case for empty `user_id` header
- [ ] Update request documentation to clarify `user_id` header requirement
