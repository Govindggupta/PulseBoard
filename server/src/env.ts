import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
    PORT: z.string(),
});

const createEnv = (env: NodeJS.ProcessEnv) => {
    const safeParseResult = envSchema.safeParse(env);
    if (!safeParseResult.success) {
        throw new Error(`Invalid environment variables: ${JSON.stringify(safeParseResult.error.issues)}`);
    }
    return safeParseResult.data;
};

export const env = createEnv(process.env);
