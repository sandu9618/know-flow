# US-111: Defended Against Prompt Injection

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-111 |
| **Week** | 11 |
| **Classification** | Learning |
| **Learning topic** | Input sanitization, system/user prompt separation, output validation |
| **Article** | Prompt Injection — What It Is and How to Defend Against It |
| **Git tag** | `week-11-security` |
| **Requirements** | FR-15, NFR-06 |

## Actor

Team member

## User Story

As a **team member**, I want to **be protected from prompt injection in production chat** so that **malicious input cannot override system instructions or leak secrets**.

## Preconditions

- US-110 attack demonstrated on naive endpoint
- Defense middleware deployed on production `/chat` path

## Steps

1. Submit the same injection payload used in US-110 to the defended chat endpoint.
2. Observe injection blocked or neutralized.
3. Receive normal helpful response or safe refusal — not attacker-controlled output.
4. Verify system prompt not leaked in response.

## Expected Outcome

- Defense middleware sanitizes input before prompt assembly.
- System and user prompts strictly separated in API calls.
- Output validation catches suspicious responses.

## Acceptance Criteria

- [ ] Defended path blocks or neutralizes the same injection attempt from US-110
- [ ] System prompts separated from user input in API calls
- [ ] Input sanitization applied before injection into prompts
- [ ] Article documents defense with code snippets

## Implementation Notes

Week 11 defense deliverable. Pair with US-110 for before/after article narrative.
