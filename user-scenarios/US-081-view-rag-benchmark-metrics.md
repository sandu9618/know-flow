# US-081: View RAG Benchmark Metrics

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-081 |
| **Week** | 8 |
| **Classification** | Learning |
| **Learning topic** | Benchmarking — latency, tokens, complexity |
| **Article** | LangChain vs Raw API — Which Should You Use? |
| **Git tag** | `week-08-langchain-compare` |
| **Requirements** | FR-12 |

## Actor

Developer

## User Story

As a **developer**, I want to **see benchmark metrics comparing RAG implementations** so that **I can make an informed choice between LangChain and raw API for my use case**.

## Preconditions

- US-080 comparison runs completed
- Benchmark script executed

## Steps

1. Run benchmark script against test question set.
2. View comparison table: latency, token count, lines of code.
3. Review metrics for speed, complexity, flexibility, and estimated cost.

## Expected Outcome

- Benchmark metrics recorded and displayed.
- Article-ready comparison table available.
- Clear winner per dimension (may differ by metric).

## Acceptance Criteria

- [ ] Benchmark metrics recorded: latency, token count, lines of code
- [ ] Comparison table displayed in UI or exportable
- [ ] Metrics cover speed, complexity, flexibility, cost dimensions
- [ ] Results reproducible from documented test set

## Implementation Notes

Week 8 acceptance criteria from ROADMAP. Direct input for "LangChain vs Raw API" article comparison table.
