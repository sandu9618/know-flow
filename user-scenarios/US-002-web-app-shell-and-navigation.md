# US-002: Launch Web App Shell and Navigation

## Metadata

| Field | Value |
|-------|-------|
| **ID** | US-002 |
| **Week** | 0 (pre-requisite) |
| **Classification** | Infrastructure |
| **Article** | — |
| **Git tag** | — |
| **Requirements** | Foundation for FR-02+ |

## Actor

Team member

## User Story

As a **team member**, I want to **open KnowFlow in my browser and navigate between feature areas** so that **I can use prompts, documents, chat, search, and dashboards as they are built each week**.

## Preconditions

- US-000 and US-001 completed
- React app runs on port 5173

## Steps

1. Open the KnowFlow web app in a browser.
2. See a layout with navigation placeholders for: Prompt Templates, Documents, Chat, Search, Agents, Cost Dashboard.
3. Navigate between sections; inactive sections show "Coming in Week N" or are hidden until implemented.

## Expected Outcome

- Consistent app shell (header, sidebar or tabs, content area).
- Routes exist for future features without breaking navigation.

## Acceptance Criteria

- [ ] App loads without console errors
- [ ] Navigation structure accommodates all 12-week features
- [ ] API base URL configured via environment variable
- [ ] Responsive layout usable on desktop

## Implementation Notes

Generic React/Vite UI scaffolding. Not tied to a specific AI learning topic.
