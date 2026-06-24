# US-101: Identify High-Cost Queries

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-101 |
| **Week** | 10 |
| **Classification** | Learning |
| **Learning topic** | Usage budgeting, top token consumers |
| **Article** | How to Stop Burning Money on LLM API Calls |
| **Git tag** | `week-10-cost-tracking` |
| **Requirements** | FR-14 |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **see which queries consumed the most tokens** so that **I can optimize expensive prompts and retrieval strategies**.

## Preconditions

- Multiple chat and agent sessions logged in `usage_logs`

## Steps

1. Navigate to Cost Dashboard.
2. View "Top queries by token usage" or equivalent ranking.
3. Inspect highest-cost entries: endpoint, token counts, estimated cost, timestamp.
4. Identify patterns (e.g. large context windows, long agent runs).

## Expected Outcome

- Ranked list of highest token-consuming requests.
- Enough detail to investigate and optimize.

## Acceptance Criteria

- [ ] User can see which queries consumed the most tokens
- [ ] Top consumers sortable by prompt tokens, completion tokens, or cost
- [ ] Each entry links to or shows request context
- [ ] Data updates as new LLM calls are made

## Implementation Notes

Practical cost optimization learning — actionable insight beyond raw totals.
