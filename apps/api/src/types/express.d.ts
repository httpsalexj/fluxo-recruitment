import type { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      candidate?: {
        id: string;
        discordId: string;
        email?: string;
        username?: string;
      };
      admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
      requestId?: string;
    }
  }
}

export {};
