import type { Request, Response, NextFunction } from 'express';
import { env } from '../env.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Like middleware but doesn't block if no token — attaches user if present
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = (req.headers.authorization ?? req.headers['authorization']) as string | undefined;
        if (!authHeader) {
            return next(); // No token — continue without user
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) {
            return next();
        }

        const decodedToken = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { id?: string };
        if (!decodedToken || !decodedToken.id) {
            return next();
        }

        const usersResult = await db.select().from(users).where(eq(users.id, decodedToken.id));
        const user = usersResult[0];

        if (user) {
            req.user = user;
        }

        return next();
    } catch {
        return next(); // Invalid token — continue without user
    }
};
