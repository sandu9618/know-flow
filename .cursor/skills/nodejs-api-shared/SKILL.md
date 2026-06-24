---
name: nodejs-api-shared
description: Canonical KnowFlow Node.js API conventions — request flow, validation, middleware, response envelopes, AppError, layer boundaries, and cross-layer code examples. Referenced by layer skills; use when reviewing any apps/api endpoint across routes, controllers, services, or repositories.
---

# KnowFlow Node.js API — Shared

Single source of truth for rules that apply across all API layers. Layer skills link here instead of duplicating content.

- **Conventions**: [conventions.md](conventions.md) — flow, validation, middleware, envelopes, errors, boundaries
- **Examples**: [examples.md](examples.md) — `validate`, `AppError`, `asyncHandler`, `getById`, `uploadAndEnqueue`, vector search, streaming

## Layer skills

- [nodejs-routes-layer](../nodejs-routes-layer/SKILL.md)
- [nodejs-controller-layer](../nodejs-controller-layer/SKILL.md)
- [nodejs-service-layer](../nodejs-service-layer/SKILL.md)
- [nodejs-repository-layer](../nodejs-repository-layer/SKILL.md)
