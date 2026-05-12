import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import crypto from "crypto";

// Generates IDs like: x7k9mq2p (8 chars, a-z + 0-9)
export function generatePollId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const responseModeEnum = pgEnum("response_mode", [
  "ANONYMOUS",
  "AUTHENTICATED",
]);

export const polls = pgTable(
  "polls",
  {
    id: varchar("id", { length: 8 }).primaryKey().$defaultFn(() => generatePollId()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    responseMode: responseModeEnum("response_mode").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("polls_creator_idx").on(table.creatorId),
    index("polls_expires_idx").on(table.expiresAt),
    index("polls_published_idx").on(table.isPublished),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pollId: varchar("poll_id", { length: 8 })
      .references(() => polls.id, {
        onDelete: "cascade",
      })
      .notNull(),
    question: text("question").notNull(),
    required: boolean("required").default(true).notNull(),
    order: integer("order").notNull(),
  },
  (table) => [index("questions_poll_idx").on(table.pollId)],
);

export const options = pgTable(
  "options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [index("options_question_idx").on(table.questionId)],
);

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pollId: varchar("poll_id", { length: 8 })
      .references(() => polls.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    anonymousIdentifier: varchar("anonymous_identifier", { length: 255 }),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("responses_poll_idx").on(table.pollId),
    index("responses_user_idx").on(table.userId),
    index("responses_submitted_idx").on(table.submittedAt),
    uniqueIndex("responses_poll_user_unique").on(table.pollId, table.userId),
  ],
);

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .references(() => responses.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    optionId: uuid("option_id")
      .references(() => options.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    index("answers_response_idx").on(table.responseId),
    index("answers_question_idx").on(table.questionId),
    index("answers_option_idx").on(table.optionId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  polls: many(polls),
}));

export const pollsRelations = relations(polls, ({ one, many }) => ({
  creator: one(users, {
    fields: [polls.creatorId],
    references: [users.id],
  }),
  questions: many(questions),
  responses: many(responses),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [questions.pollId],
    references: [polls.id],
  }),
  options: many(options),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

export const responsesRelations = relations(responses, ({ one, many }) => ({
  poll: one(polls, {
    fields: [responses.pollId],
    references: [polls.id],
  }),

  user: one(users, {
    fields: [responses.userId],
    references: [users.id],
  }),

  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(responses, {
    fields: [answers.responseId],
    references: [responses.id],
  }),

  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),

  option: one(options, {
    fields: [answers.optionId],
    references: [options.id],
  }),
}));