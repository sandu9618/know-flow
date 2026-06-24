# US-080: Compare RAG Implementations

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-080 |
| **Week** | 8 |
| **Classification** | Learning |
| **Learning topic** | LangChain vs raw API — parallel RAG paths |
| **Article** | LangChain vs Raw API — Which Should You Use? |
| **Git tag** | `week-08-langchain-compare` |
| **Requirements** | FR-12 |

## Actor

Developer

## User Story

As a **developer**, I want to **run the same question through Node raw API RAG and Python LangChain RAG** so that **I can compare approaches on equal footing**.

## Preconditions

- Node RAG pipeline working (Weeks 3–4)
- LangChain RAG path implemented in Python worker
- Shared test question set available

## Steps

1. Navigate to comparison view (React or CLI).
2. Select or enter a test question.
3. Run question against Node raw API path.
4. Run same question against Python LangChain path.
5. View both answers side by side.

## Expected Outcome

- Both paths answer the same test questions.
- Answers are comparable in quality (may differ slightly in wording).
- Comparison run recorded for benchmark.

## Acceptance Criteria

- [ ] Both paths (Node raw API vs Python LangChain) answer the same test questions
- [ ] LangChain-based RAG pipeline in Python performs same task as Node RAG
- [ ] Comparison UI or CLI accessible from app
- [ ] Test question set documented for reproducibility

## Implementation Notes

Core Week 8 learning scenario. Article compares abstraction vs control tradeoffs.
