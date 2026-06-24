import express from 'express';
import { config, validateStartupConfig } from './config.js';
import { healthRouter } from './routes/health.routes.js';

validateStartupConfig();

const app = express();

app.use(express.json());
app.use('/health', healthRouter);

app.listen(config.port, () => {
  console.log(`KnowFlow API listening on http://localhost:${config.port}`);
});
