import { MongoClient, type Db } from 'mongodb';
import { config } from '../config.js';

let client: MongoClient | null = null;
let connectPromise: Promise<MongoClient> | null = null;

function getMongoClientOptions() {
  return {
    maxPoolSize: config.mongodb.maxPoolSize,
    serverSelectionTimeoutMS: config.mongodb.serverSelectionTimeoutMS,
  };
}

export function getMongoHostForLogging(): string {
  try {
    const url = new URL(config.mongodbUri);
    return url.host;
  } catch {
    return '(invalid URI)';
  }
}

export async function connectMongo(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  if (!connectPromise) {
    connectPromise = MongoClient.connect(config.mongodbUri, getMongoClientOptions())
      .then((connectedClient) => {
        client = connectedClient;
        return connectedClient;
      })
      .catch((error: unknown) => {
        connectPromise = null;
        throw error;
      });
  }

  return connectPromise;
}

export function getDb(): Db {
  if (!client) {
    throw new Error('MongoDB client is not connected. Call connectMongo() first.');
  }

  return client.db();
}

export async function pingMongo(): Promise<boolean> {
  if (!client) {
    return false;
  }

  try {
    await client.db().command({ ping: 1 }, { timeoutMS: 2000 });
    return true;
  } catch {
    return false;
  }
}

export async function closeMongo(): Promise<void> {
  if (!client) {
    connectPromise = null;
    return;
  }

  await client.close();
  client = null;
  connectPromise = null;
}
