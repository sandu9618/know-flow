import type { Request, Response } from 'express';
import { healthService } from '../services/health.service.js';

export const healthController = {
  async getHealth(_req: Request, res: Response): Promise<void> {
    const health = await healthService.getHealthStatus();
    const statusCode = health.db === 'connected' ? 200 : 503;

    res.status(statusCode).json({ data: health });
  },
};
