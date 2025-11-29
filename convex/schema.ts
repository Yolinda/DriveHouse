import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(), // Firebase UID
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
    totalPoints: v.number(),
    premiumStatus: v.boolean(),
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_userId", ["userId"]), // Unique index for fast lookups by Firebase UID
});
