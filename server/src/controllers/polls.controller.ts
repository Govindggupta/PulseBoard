import type { Request, Response } from "express";
import { env } from "../env.js";
import { createPollSchema, updatePollSchema } from "../schema/polls.schema.js";
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

export const handleUpdatePollById = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { pollId } = req.params;
        if (typeof pollId !== "string" || pollId.length === 0) {
            return res.status(400).json({ error: "Invalid poll ID" });
        }

        const parsedData = updatePollSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                error: "Invalid request data",
                details: parsedData.error.issues,
            });
        }

        const existingPoll = await db.query.polls.findFirst({
            where: eq(polls.id, pollId),
        });

        if (!existingPoll) {
            return res.status(404).json({ error: "Poll not found" });
        }

        if (existingPoll.creatorId !== req.user.id) {
            return res.status(403).json({ error: "Forbidden: not poll owner" });
        }

        if (existingPoll.isPublished) {
            return res.status(400).json({ error: "Cannot update a published poll" });
        }

        const { title, description, responseMode, expiresAt, questions: questionsData } = parsedData.data;

        await db.transaction(async (tx) => {
            // 1. Update poll fields if provided
            const pollUpdate: Record<string, unknown> = {};
            if (title !== undefined) pollUpdate.title = title;
            if (description !== undefined) pollUpdate.description = description;
            if (responseMode !== undefined) pollUpdate.responseMode = responseMode;
            if (expiresAt !== undefined) pollUpdate.expiresAt = new Date(expiresAt);

            if (Object.keys(pollUpdate).length > 0) {
                await tx.update(polls).set(pollUpdate).where(eq(polls.id, pollId));
            }

            // 2. Handle questions granularly
            if (questionsData && questionsData.length > 0) {
                for (const qInput of questionsData) {

                    // --- DELETE question ---
                    if (qInput.delete && qInput.id) {
                        await tx.delete(questions).where(eq(questions.id, qInput.id));
                        continue;
                    }

                    // --- CREATE new question (no id) ---
                    if (!qInput.id) {
                        if (!qInput.question) {
                            throw new Error("Question text is required when creating a new question");
                        }

                        const [newQ] = await tx
                            .insert(questions)
                            .values({
                                pollId,
                                question: qInput.question,
                                required: qInput.required ?? true,
                                order: qInput.order ?? 1,
                            })
                            .returning();

                        if (!newQ) throw new Error("Failed to create question");

                        // Insert options for new question
                        if (qInput.options && qInput.options.length > 0) {
                            for (const optInput of qInput.options) {
                                if (optInput.delete) continue;
                                if (!optInput.text) throw new Error("Option text is required");
                                await tx.insert(options).values({
                                    questionId: newQ.id,
                                    text: optInput.text,
                                    order: optInput.order ?? 1,
                                });
                            }
                        }
                        continue;
                    }

                    // --- UPDATE existing question (has id) ---
                    const existingQ = await tx.query.questions.findFirst({
                        where: eq(questions.id, qInput.id),
                    });

                    if (!existingQ) throw new Error(`Question ${qInput.id} not found`);
                    if (existingQ.pollId !== pollId) throw new Error("Question does not belong to this poll");

                    // Update question fields
                    const qUpdate: Record<string, unknown> = {};
                    if (qInput.question !== undefined) qUpdate.question = qInput.question;
                    if (qInput.required !== undefined) qUpdate.required = qInput.required;
                    if (qInput.order !== undefined) qUpdate.order = qInput.order;

                    if (Object.keys(qUpdate).length > 0) {
                        await tx.update(questions).set(qUpdate).where(eq(questions.id, qInput.id));
                    }

                    // Handle options for this question
                    if (qInput.options && qInput.options.length > 0) {
                        for (const optInput of qInput.options) {

                            // DELETE option
                            if (optInput.delete && optInput.id) {
                                await tx.delete(options).where(eq(options.id, optInput.id));
                                continue;
                            }

                            // CREATE new option (no id)
                            if (!optInput.id) {
                                if (!optInput.text) throw new Error("Option text is required");
                                await tx.insert(options).values({
                                    questionId: qInput.id,
                                    text: optInput.text,
                                    order: optInput.order ?? 1,
                                });
                                continue;
                            }

                            // UPDATE existing option (has id)
                            const optUpdate: Record<string, unknown> = {};
                            if (optInput.text !== undefined) optUpdate.text = optInput.text;
                            if (optInput.order !== undefined) optUpdate.order = optInput.order;

                            if (Object.keys(optUpdate).length > 0) {
                                await tx.update(options).set(optUpdate).where(eq(options.id, optInput.id));
                            }
                        }
                    }
                }
            }
        });

        // Fetch and return the updated poll
        const updatedPoll = await db.query.polls.findFirst({
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

        return res.status(200).json({
            message: "Poll updated successfully",
            poll: updatedPoll,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update poll",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}