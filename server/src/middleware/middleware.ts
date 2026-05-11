import type { Request, Response, NextFunction } from 'express';
import { env } from '../env.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const middleware = async (req: Request, res: Response , next: NextFunction) => {   
    try {
        const authHeader = (req.headers.authorization ?? req.headers['authorization']) as string | undefined;
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { id?: string };
        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ message: 'Unauthorized or Invalid token' });
        }

        const usersResult = await db.select().from(users).where(eq(users.id, decodedToken.id));

        const user = usersResult[0];

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized or Invalid token' });
        }

        req.user = user;

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized or Invalid token' });
    }
};