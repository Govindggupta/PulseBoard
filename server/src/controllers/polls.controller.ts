import type { Request, Response } from "express";
import { env } from "../env.js";
import { createPollSchema } from "../schema/polls.schema.js";
import { db } from "../db/index.js";
import { polls, questions, options } from "../db/schema.js";
import { desc, eq, asc } from "drizzle-orm";

export const handleCreatePoll = async (req: Request, res: Response) => {
    try {
        const parsedData = createPollSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: parsedData.error.issues,
            });
        }

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const {
            title,
            description,
            responseMode,
            expiresAt,
            questions: questionsData,
        } = parsedData.data;

        const newPoll = await db.transaction(async (tx) => {
            // Insert poll
            const [poll] = await tx
                .insert(polls)
                .values({
                    title,
                    description,
                    responseMode,
                    expiresAt: new Date(expiresAt),
                    creatorId: req.user!.id,
                })
                .returning();

            if (!poll) {
                throw new Error("Failed to create poll");
            }

            // If questions provided, insert them with options in the same transaction
            if (questionsData && questionsData.length > 0) {
                for (const q of questionsData) {
                    const [question] = await tx
                        .insert(questions)
                        .values({
                            pollId: poll.id,
                            question: q.question,
                            required: q.required,
                            order: q.order,
                        })
                        .returning();

                    if (!question) {
                        throw new Error("Failed to create question");
                    }

                    // Insert options for this question
                    if (q.options && q.options.length > 0) {
                        await tx.insert(options).values(
                            q.options.map((opt) => ({
                                questionId: question.id,
                                text: opt.text,
                                order: opt.order,
                            })),
                        );
                    }
                }
            }

            return poll;
        });

        return res.status(201).json({
            message: "Poll created successfully",
            poll: newPoll,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create poll",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const handleGetUserPolls = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const userPolls = await db.query.polls.findMany({
            where: eq(polls.creatorId, req.user.id),
            orderBy: [desc(polls.createdAt)],
            with: {
                questions: {
                    orderBy: [asc(questions.order)],
                    with: {
                        options: {
                            orderBy: [asc(options.order)],
                        },
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Polls fetched successfully",
            polls: userPolls,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch polls",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const handleGetPollById = async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    if (typeof pollId !== "string") {
      return res.status(400).json({ error: "Invalid poll ID" });
    }

    const poll = await db.query.polls.findFirst({
      where: eq(polls.id, pollId),
      with: {
        questions: {
          orderBy: [asc(questions.order)],
          with: {
            options: {
              orderBy: [asc(options.order)],
            },
          },
        },
      },
    });

    if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
    }

    return res.status(200).json({
        message: "Poll fetched successfully",
        poll 
    })
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch poll",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    }
};

export const handleDeletePollById = async (req: Request, res: Response) => {
        try {
            const { pollId } = req.params;
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (typeof pollId !== "string" || pollId.length === 0) {
                return res.status(400).json({ error: "Invalid poll ID" });
            }

            const poll = await db.query.polls.findFirst({ where: eq(polls.id, pollId) });
            if (!poll) {
                return res.status(404).json({ error: "Poll not found" });
            }

            if (poll.creatorId !== req.user.id) {
                return res.status(403).json({ error: "Forbidden: not poll owner" });
            }

            await db.delete(polls).where(eq(polls.id, pollId));

            return res.status(204).json({message: "Poll deleted successfully"});
        } catch (error) {
            return res.status(500).json({
                message: "Failed to delete poll",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
};