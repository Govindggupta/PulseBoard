import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { answers, responses } from "../db/schema.js";
import { redis } from "./redis.js";

// Increment total response count for a poll
export async function incrementPollResponseCount(pollId: string) {
  await redis.incr(`poll:${pollId}:responses`);
}

// Increment vote count for a specific option
export async function incrementOptionVoteCount(pollId: string, optionId: string) {
  await redis.incr(`poll:${pollId}:option:${optionId}`);
}

// Get total response count (Redis first, DB fallback)
export async function getPollResponseCount(pollId: string): Promise<number> {
  const cached = await redis.get(`poll:${pollId}:responses`);

  if (cached !== null) {
    return Number(cached);
  }

  // Cache miss — count from DB and store
  const rows = await db
    .select({ id: responses.id })
    .from(responses)
    .where(eq(responses.pollId, pollId));

  const count = rows.length;
  await redis.set(`poll:${pollId}:responses`, count);

  return count;
}

// Get vote count for a specific option (Redis first, DB fallback)
export async function getOptionVoteCount(pollId: string, optionId: string): Promise<number> {
  const cached = await redis.get(`poll:${pollId}:option:${optionId}`);

  if (cached !== null) {
    return Number(cached);
  }

  // Cache miss — count from DB and store
  const rows = await db
    .select({ id: answers.id })
    .from(answers)
    .where(eq(answers.optionId, optionId));

  const count = rows.length;
  await redis.set(`poll:${pollId}:option:${optionId}`, count);

  return count;
}
