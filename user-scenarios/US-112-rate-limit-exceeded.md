# US-112: Rate Limit Exceeded

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-112 |
| **Week** | 11 |
| **Classification** | Hybrid |
| **Learning topic** | Rate limiting on chat and upload endpoints |
| **Article** | Prompt Injection — What It Is and How to Defend Against It |
| **Git tag** | `week-11-security` |
| **Requirements** | FR-15 |

## Actor

Team member / Attacker

## User Story

As a **team member**, I want to **receive a clear rate limit error when I exceed request thresholds** so that **the system is protected from abuse while honest users understand the limit**.

## Preconditions

- Rate limiting middleware on `/chat` and `/upload`
- Threshold configured (e.g. N requests per minute per IP or session)

## Steps

1. Send rapid consecutive chat messages or uploads exceeding the threshold.
2. Receive HTTP 429 Too Many Requests.
3. See user-friendly message with retry guidance.
4. After cooldown, requests succeed again.

## Expected Outcome

- Rate limiter returns 429 after threshold exceeded.
- Legitimate usage below threshold unaffected.
- Limits apply to both chat and upload endpoints.

## Acceptance Criteria

- [ ] Rate limiter returns 429 after threshold exceeded
- [ ] `/chat` and `/upload` both rate limited
- [ ] Response includes Retry-After or equivalent guidance
- [ ] Rate limit events logged for monitoring

## Implementation Notes

Security hardening (Week 11) implemented via standard middleware (infrastructure). Complements injection defenses.
