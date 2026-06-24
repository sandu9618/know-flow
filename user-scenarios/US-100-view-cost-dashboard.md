# US-100: View Cost Dashboard

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-100 |
| **Week** | 10 |
| **Classification** | Learning |
| **Learning topic** | Token counting, cost estimation, usage dashboard |
| **Article** | How to Stop Burning Money on LLM API Calls |
| **Git tag** | `week-10-cost-tracking` |
| **Requirements** | FR-14, NFR-05 |

## Actor

Knowledge owner

## User Story

As a **knowledge owner**, I want to **view total and daily AI spend on a dashboard** so that **I can monitor and control API costs for my team**.

## Preconditions

- Token logging middleware active on all LLM calls
- `usage_logs` collection populated

## Steps

1. Navigate to Cost Dashboard.
2. View cumulative estimated spend in USD.
3. View daily spend chart over the past 7–30 days.
4. View spend breakdown by endpoint (`/chat`, `/agents`, etc.).

## Expected Outcome

- Dashboard shows real usage data from development and testing.
- Cost estimates based on `promptTokens`, `completionTokens`, and model pricing.

## Acceptance Criteria

- [ ] Dashboard shows cumulative and daily cost estimates
- [ ] Every LLM call records token usage in `usage_logs`
- [ ] Spend per endpoint visible
- [ ] Article includes real cost data from development usage

## Implementation Notes

Core Week 10 learning scenario. Article uses real numbers from the dashboard.
