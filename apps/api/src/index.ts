import express from 'express';
import cors from 'cors';
import type { Server } from 'node:http';
import { closeMongo, connectMongo, getMongoHostForLogging } from './clients/mongodb.client.js';
import { config, validateStartupConfig } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { promptTemplatesRepository } from './repositories/prompt-templates.repository.js';
import { healthRouter } from './routes/health.routes.js';
import { promptTemplatesRouter } from './routes/prompt-templates.routes.js';

validateStartupConfig();

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/health', healthRouter);
app.use('/api/prompt-templates', promptTemplatesRouter);
app.use(errorHandler);

async function startServer(): Promise<Server> {
  try {
    await connectMongo();
    console.log(`MongoDB connected (${getMongoHostForLogging()})`);
    await promptTemplatesRepository.ensureIndexes();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to connect to MongoDB at ${getMongoHostForLogging()}: ${message}\n` +
        'Ensure MongoDB is running (npm run docker:up) and MONGODB_URI is correct in .env.'
    );
    process.exit(1);
  }

  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      console.log(`KnowFlow API listening on http://localhost:${config.port}`);
      resolve(server);
    });
  });
}

function shutdown(server: Server, signal: string): void {
  console.log(`Received ${signal}, shutting down gracefully...`);

  server.close(async () => {
    try {
      await closeMongo();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (error: unknown) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
}

const serverPromise = startServer();

serverPromise.then((server) => {
  process.on('SIGINT', () => shutdown(server, 'SIGINT'));
  process.on('SIGTERM', () => shutdown(server, 'SIGTERM'));
});

serverPromise.catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
