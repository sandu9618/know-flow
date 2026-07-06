---
name: US-012 Edit Prompt Template
overview: Add `PUT /api/prompt-templates/:id` with server-side variable re-extraction and an edit flow on `/prompts` that reuses the existing create form pattern, TanStack Query cache invalidation, and list selection — completing the Update leg of Week 1 FR-01 CRUD.
todos:
  - id: api-update-schema
    content: Add updatePromptTemplateSchema (params.id + reuse create body) in prompt-templates.schema.ts
    status: completed
  - id: api-repository-update
    content: Add repository updateById with findOneAndUpdate, preserve createdAt, set updatedAt
    status: completed
  - id: api-service-put
    content: "Add service update(): extractVariables, isValidPattern, 404/409 handling"
    status: completed
  - id: api-route-put
    content: Wire PUT /:id through controller and prompt-templates.routes.ts
    status: completed
  - id: web-api-client
    content: Add updatePromptTemplate() to promptTemplates.api.ts + UpdatePromptTemplateRequest type
    status: completed
  - id: web-edit-form
    content: Refactor form for create/edit modes with useMutation, Cancel, success/error states
    status: completed
  - id: web-list-edit
    content: Add Edit button to PromptTemplateList; lift editingTemplate state in PromptsPage
    status: completed
  - id: verify-us012
    content: "Manual test: edit persists after restart, variables re-extract, invalid pattern 400, duplicate name 409"
    status: completed
isProject: false
---

# US-012: Edit an Existing Prompt Template

## 1. Scenario summary

- **Actor** — Knowledge owner using the KnowFlow web app
- **Goal** — Refine a saved prompt template (text, pattern, derived variables) and persist changes as they learn which patterns work best
- **Success criteria**
  - `PUT /api/prompt-templates/:id` updates the MongoDB document and returns the updated DTO
  - `updatedAt` changes; `createdAt` is preserved
  - `variables` is recomputed server-side when `{{placeholder}}` syntax changes (client cannot set `variables`)
  - Invalid `pattern` values are rejected with `400` and a clear error message
  - Edited template survives API restart; re-opening from the list shows persisted values

**Preconditions:** US-010 (create) and US-011 (list) are implemented — [`POST`/`GET`](apps/api/src/routes/prompt-templates.routes.ts), [`PromptTemplateList`](apps/web/src/features/prompts/PromptTemplateList.tsx), [`CreatePromptTemplateForm`](apps/web/src/features/prompts/CreatePromptTemplateForm.tsx) with TanStack Query invalidation.

---

## 2. Current state

**Already in place:**

| Area | Status |
|------|--------|
| MongoDB `prompt_templates` + unique `name` index | [`prompt-templates.repository.ts`](apps/api/src/repositories/prompt-templates.repository.ts) — `insert`, `findAll`, `ensureIndexes` |
| `POST` + `GET /api/prompt-templates` | Full route → controller → service → repository chain |
| Variable extraction + pattern validation | [`@knowflow/prompts`](packages/prompts/src/variables.ts) — `extractVariables`, `isValidPattern`; service already uses both on create |
| List UI with pattern badges and variable count | [`PromptTemplateList.tsx`](apps/web/src/features/prompts/PromptTemplateList.tsx) — fetches full `PromptTemplate[]` (includes `template` text) |
| Create form + query cache | [`CreatePromptTemplateForm.tsx`](apps/web/src/features/prompts/CreatePromptTemplateForm.tsx) — `useMutation` + `invalidateQueries({ queryKey: promptTemplatesQueryKey })` |
| Validation middleware | [`validate.ts`](apps/api/src/middleware/validate.ts) + Zod schemas in [`prompt-templates.schema.ts`](apps/api/src/schemas/prompt-templates.schema.ts) |
| Error envelope | `AppError` → [`errorHandler.ts`](apps/api/src/middleware/errorHandler.ts); web maps via [`ApiError`](apps/web/src/lib/api.ts) |

**Gaps vs US-012:**

| Requirement | Gap |
|-------------|-----|
| `PUT /api/prompt-templates/:id` | No route, handler, service method, or repository `updateById` |
| Select template + edit UI | List rows are read-only — no selection or edit affordance |
| Save changes (update mutation) | API client only has `createPromptTemplate` / `listPromptTemplates` |
| `updatedAt` on edit | Repository only sets timestamps on `insert` |
| 404 for missing id | No `NOT_FOUND` usage in prompt-templates layer yet |

**Out of scope:** `GET /:id` (list already returns full documents — sufficient to pre-fill edit form), `DELETE` (US-013), variable preview/substitution (US-014), Python worker, queues, auth.

---

## 3. End-to-end flow

```mermaid
sequenceDiagram
    participant User
    participant Web as React_Web
    participant Query as TanStack_Query
    participant API as Node_API
    participant Prompts as knowflow_prompts
    participant DB as MongoDB

    User->>Web: Click Edit on list row
    Web->>Web: Pre-fill form from cached template
    User->>Web: Change pattern, template text
    Web->>Web: Show live detectedVariables via extractVariables
    User->>Web: Save changes
    Web->>API: PUT /api/prompt-templates/:id
    API->>API: Zod validate params + body
    API->>Prompts: isValidPattern, extractVariables
    API->>DB: findOneAndUpdate by _id
    DB-->>API: updated doc or null
    API-->>Web: 200 data PromptTemplate
    Web->>Query: invalidate prompt-templates
    Query->>API: GET /api/prompt-templates
    API-->>Web: Refreshed list with new updatedAt
    Web-->>User: Success; list reflects changes
```

**Numbered user steps:**

1. User opens `/prompts` — list loads via existing `usePromptTemplates`.
2. User clicks **Edit** on a template row (selection affordance on list item).
3. Edit form appears (reuse create form area) pre-filled with `name`, `pattern`, `template` from the selected `PromptTemplate`.
4. User modifies fields; client shows detected variables live (same `extractVariables` as create form).
5. User clicks **Save changes** → `PUT /api/prompt-templates/:id` with `{ name, pattern, template }`.
6. API validates, re-extracts `variables`, sets `updatedAt`, returns `200 { data }`.
7. Web invalidates `['prompt-templates']`, clears edit mode, shows success.
8. User clicks **Edit** again (or refreshes page / restarts API) — persisted values match last save.

---

## 4. Implementation breakdown

| Layer | Changes | Key files / modules |
|-------|---------|---------------------|
| **React (`apps/web`)** | Add `updatePromptTemplate()` API client; refactor create form into dual-mode **PromptTemplateForm** (create vs edit) or add parallel **EditPromptTemplateForm** sharing field markup; lift `editingTemplate` state in [`PromptsPage.tsx`](apps/web/src/features/prompts/PromptsPage.tsx); add **Edit** button per list row in [`PromptTemplateList.tsx`](apps/web/src/features/prompts/PromptTemplateList.tsx) with `onEdit(template)` callback; `useMutation` for PUT + invalidate query; **Cancel** exits edit mode without API call | [`promptTemplates.api.ts`](apps/web/src/features/prompts/promptTemplates.api.ts), [`CreatePromptTemplateForm.tsx`](apps/web/src/features/prompts/CreatePromptTemplateForm.tsx) (refactor or split), [`PromptTemplateList.tsx`](apps/web/src/features/prompts/PromptTemplateList.tsx), [`PromptsPage.tsx`](apps/web/src/features/prompts/PromptsPage.tsx), CSS modules |
| **Node API — routes** | `PUT /:id` with `validate(updatePromptTemplateSchema)` + `asyncHandler` — register **after** `GET /` and `POST /` | [`prompt-templates.routes.ts`](apps/api/src/routes/prompt-templates.routes.ts) |
| **Node API — controller** | `updatePromptTemplate` — read `req.params.id` + validated body, call service, `200` + `{ data }` | [`prompt-templates.controller.ts`](apps/api/src/controllers/prompt-templates.controller.ts) |
| **Node API — service** | `update(id, input)` — `isValidPattern`; `extractVariables(input.template)`; delegate to repository; map duplicate name → `409`; missing/invalid id → `404` / `400` | [`prompt-templates.service.ts`](apps/api/src/services/prompt-templates.service.ts) |
| **Node API — repository** | `updateById(id, fields)` — `findOneAndUpdate` with `$set: { name, pattern, template, variables, updatedAt }`, `returnDocument: 'after'`; return `null` if not found; use `ObjectId` only after format validation in service/schema | [`prompt-templates.repository.ts`](apps/api/src/repositories/prompt-templates.repository.ts) |
| **Node API — validation** | `updatePromptTemplateSchema`: `params.id` (24-char hex ObjectId string) + **reuse** create `body` shape (`name`, `pattern`, `template`) | [`prompt-templates.schema.ts`](apps/api/src/schemas/prompt-templates.schema.ts) |
| **Node API — types** | Add `UpdatePromptTemplateInput` (same fields as create) in [`prompt-template.types.ts`](apps/api/src/types/prompt-template.types.ts); mirror `UpdatePromptTemplateRequest` in web types | API + web type files |
| **Shared (`packages/prompts`)** | No changes — reuse existing helpers | [`packages/prompts`](packages/prompts/src/index.ts) |
| **Python worker** | None | — |
| **Data (MongoDB)** | No new collection or indexes; `updateOne` / `findOneAndUpdate` on `prompt_templates` by `_id` | existing collection |

**Recommended UI pattern (minimal scope):**

- Keep a **single page** (`/prompts`) — no new route required for Week 1.
- [`PromptsPage`](apps/web/src/features/prompts/PromptsPage.tsx) holds `editingTemplate: PromptTemplate | null`.
- When `editingTemplate` is set, render edit form above create form (or hide create form while editing — either is fine; hiding reduces clutter).
- Pass `onEdit` from page into list; list item gets an accessible **Edit** button (`type="button"`).

**Form refactor (prefer reuse over duplication):**

Extract shared fields (name, pattern select, template textarea, variable hint, error/success) into one component accepting:

- `mode: 'create' | 'edit'`
- `initialValues` (edit) or empty defaults (create)
- `onSubmit` / `isPending` / `error` / `successMessage`

Mirror create form behaviors: live `extractVariables` preview, pattern helper text, disabled state while pending. On edit, submit calls `updatePromptTemplate(id, body)` instead of `createPromptTemplate`.

---

## 5. API and data contract

### `PUT /api/prompt-templates/:id`

**Params:**

| Param | Type | Rule |
|-------|------|------|
| `id` | string | 24-character hex MongoDB ObjectId |

**Request body** (same as create — `variables` not accepted):

```json
{
  "name": "summarize-policy-v2",
  "pattern": "chain-of-thought",
  "template": "Think step by step.\n\nQuestion: {{question}}\nContext: {{context}}"
}
```

**Success `200`:**

```json
{
  "data": {
    "id": "674a1b2c3d4e5f6789012345",
    "name": "summarize-policy-v2",
    "pattern": "chain-of-thought",
    "template": "...",
    "variables": ["question", "context"],
    "createdAt": "2026-07-03T06:47:00.000Z",
    "updatedAt": "2026-07-06T08:30:00.000Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| `400` | `VALIDATION_ERROR` | Invalid body, malformed `id`, or invalid `pattern` (Zod + service guard) |
| `404` | `TEMPLATE_NOT_FOUND` | No document for `id` |
| `409` | `DUPLICATE_TEMPLATE_NAME` | Renamed `name` conflicts with another template (unique index) |
| `500` | — | Unexpected |

**Repository update sketch:**

```typescript
// findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { ...fields, updatedAt: new Date() } }, { returnDocument: 'after' })
// Do NOT update createdAt
```

**Variable list acceptance criterion:** Changing `{{foo}}` → `{{bar}}` in `template` must persist `variables: ["bar"]` after save (server-derived, verified via GET list or PUT response).

---

## 6. Suggested build order

1. **Zod schema** — `updatePromptTemplateSchema` with `params.id` + shared body validators from [`createPromptTemplateSchema`](apps/api/src/schemas/prompt-templates.schema.ts)
2. **Repository** — `updateById(id, { name, pattern, template, variables })` using `findOneAndUpdate`; return `PromptTemplate | null`
3. **Service** — `update(id, input)`: pattern check, `extractVariables`, call repository, `404` if null, `409` on duplicate name (`MongoServerError` code 11000, same helper as create)
4. **Controller + route** — `PUT /:id` wired through `validate` + `asyncHandler`
5. **Web API client** — `updatePromptTemplate(id, input)` → `fetchJson` with `method: 'PUT'`
6. **Form refactor** — dual-mode form with edit pre-fill, Cancel, and `useMutation` for update
7. **List + page wiring** — Edit button on rows; `editingTemplate` state in `PromptsPage`
8. **Manual verification** — curl PUT, UI edit flow, invalid pattern, restart API

---

## 7. Testing and verification

**Manual (primary for Week 1):**

1. Create a template via existing form; note `id` and `updatedAt`.
2. Click **Edit**, change template text to add/remove `{{placeholders}}`, save.
3. Confirm PUT response `variables` matches new placeholders; list shows updated variable count.
4. `curl -X PUT http://localhost:3000/api/prompt-templates/<id> -H 'Content-Type: application/json' -d '{"name":"...","pattern":"few-shot","template":"..."}'` — expect `200` and newer `updatedAt`.
5. `curl` with `"pattern": "not-a-pattern"` — expect `400` with readable message in UI and API body.
6. Restart API (`npm run dev`); reload `/prompts` — edited values still present.
7. Rename to an existing template name — expect `409` in UI.

**Automated (optional, only if quick):**

- API integration test for `PUT` happy path + `404` + invalid pattern — defer unless the repo already has API test harness from US-001.

---

## 8. Roadmap fit

- **Week / phase:** Week 1 — Prompt Engineering Patterns (`week-01-prompts` tag per [ROADMAP.md](ROADMAP.md))
- **Requirement:** FR-01 (CRUD for reusable prompt templates) — this scenario delivers the **U** in CRUD; pairs with US-013 for **D**
- **Ship now:** `PUT` endpoint + edit UI on `/prompts`
- **Defer:** `GET /:id` (not needed while list returns full documents), delete confirmation UI (US-013), preview/substitution (US-014 / FR-02), auth, LLM integration

**Risks / edge cases:**

- **Duplicate name on rename:** Rely on unique index + `409` mapping (same as create).
- **Pattern starter auto-fill:** Existing `handlePatternChange` only replaces template when empty or still equals the previous pattern's `exampleStarter` — safe for edit mode where users have custom text.
- **Concurrent edits:** Last write wins — acceptable for Week 1; no optimistic locking required.
