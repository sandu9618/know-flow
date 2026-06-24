# Routes Layer Examples

Cross-layer patterns (`validate`, `AppError`, `asyncHandler`, `uploadAndEnqueue`): [shared examples](../nodejs-api-shared/examples.md)

## App bootstrap and versioned mount

```typescript
// app.ts
import express from 'express';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.status(200).json({ data: { status: 'ok' } }));
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
```

```typescript
// routes/index.ts
import { Router } from 'express';
import documentsRoutes from './documents.routes';
import chatRoutes from './chat.routes';
import searchRoutes from './search.routes';

const router = Router();

router.use('/documents', documentsRoutes);
router.use('/chat', chatRoutes);
router.use('/search', searchRoutes);

export default router;
```

## Protected resource router

```typescript
// routes/documents.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadLimiter } from '../middleware/rateLimit';
import { uploadFilter } from '../middleware/uploadFilter';
import * as documentsController from '../controllers/documents.controller';
import {
  createDocumentSchema,
  listDocumentsSchema,
  documentIdParamSchema,
} from '../schemas/documents.schema';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: uploadFilter,
});

const router = Router();

router.use(authenticate);

router.get('/', validate(listDocumentsSchema), documentsController.listDocuments);
router.get('/:id', validate(documentIdParamSchema), documentsController.getDocument);
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  validate(createDocumentSchema),
  documentsController.createDocument
);
router.delete('/:id', validate(documentIdParamSchema), documentsController.deleteDocument);

export default router;
```

## Chat route with rate limit and sanitization

```typescript
// routes/chat.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { chatLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { sanitizeUserInput } from '../middleware/sanitize';
import * as chatController from '../controllers/chat.controller';
import { chatSchema } from '../schemas/chat.schema';

const router = Router();

router.post(
  '/',
  authenticate,
  chatLimiter,
  validate(chatSchema),
  sanitizeUserInput,
  chatController.streamChat
);

export default router;
```

## Sub-resource action route

```typescript
// POST /documents/:id/reindex — non-CRUD action
router.post(
  '/:id/reindex',
  validate(documentIdParamSchema),
  documentsController.reindexDocument
);
```

## Bad vs good

**Bad — fat inline handler on route:**

```typescript
router.post('/', async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file' });
  const doc = await Document.create({ name: file.originalname });
  await queue.add('ingest', { id: doc.id });
  res.json(doc);
});
```

**Good — route wires middleware + controller:**

```typescript
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  validate(createDocumentSchema),
  documentsController.createDocument
);
```

**Bad — wrong middleware order:**

```typescript
router.post('/', documentsController.createDocument, authenticate, validate(schema));
```

**Good — auth and validate before handler:**

```typescript
router.post('/', authenticate, validate(schema), documentsController.createDocument);
```

**Bad — service imported in route file:**

```typescript
import * as documentService from '../services/documents.service';

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await documentService.getById(req.params.id);
    res.json({ data: doc });
  } catch (e) {
    next(e);
  }
});
```

**Good — controller only:**

```typescript
import * as documentsController from '../controllers/documents.controller';

router.get('/:id', validate(documentIdParamSchema), documentsController.getDocument);
```
