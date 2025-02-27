import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("draft"),
  factCheckScore: integer("fact_check_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced user schema with strong validation
export const insertUserSchema = createInsertSchema(users)
  .extend({
    username: z.string()
      .min(5, "Username must be at least 5 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Username must start with a letter and can only contain letters, numbers, and underscores"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
      .refine(
        (password) => {
          // Additional entropy check - at least 3 character types
          const hasUpper = /[A-Z]/.test(password);
          const hasLower = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[^a-zA-Z0-9]/.test(password);
          const characterTypes = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
          return characterTypes >= 3;
        },
        "Password must use at least 3 different types of characters (uppercase, lowercase, numbers, special characters)"
      ),
  });

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  content: true,
  status: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;