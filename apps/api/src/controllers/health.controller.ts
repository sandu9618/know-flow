import type { Request, Response } from 'express';

export const healthController = {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      data: { status: 'ok' },
    });
  },
};
