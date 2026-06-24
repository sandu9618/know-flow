import { pingMongo } from '../clients/mongodb.client.js';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  db: 'connected' | 'disconnected';
};

export const healthService = {
  async getHealthStatus(): Promise<HealthStatus> {
    const isConnected = await pingMongo();

    if (isConnected) {
      return { status: 'ok', db: 'connected' };
    }

    return { status: 'degraded', db: 'disconnected' };
  },
};
