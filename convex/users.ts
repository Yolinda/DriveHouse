import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create or update user in Convex database
 * This is called when a user signs in via Firebase Auth
 */
export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        email: args.email,
        displayName: args.displayName,
        photoURL: args.photoURL,
        lastLoginAt: now,
      });

      console.log(`User updated: ${args.userId}`);
      return { userId: args.userId, isNew: false };
    } else {
      // Create new user
      await ctx.db.insert("users", {
        userId: args.userId,
        email: args.email,
        displayName: args.displayName,
        photoURL: args.photoURL,
        totalPoints: 0,
        premiumStatus: false,
        createdAt: now,
        lastLoginAt: now,
      });

      console.log(`New user created: ${args.userId}`);
      return { userId: args.userId, isNew: true };
    }
  },
});

/**
 * Update user profile (displayName and photoURL)
 * Called when user edits their profile
 */
export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    photoURL: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // Find user by Firebase UID
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update only the provided fields
    const updates: any = {};
    if (args.displayName !== undefined) {
      updates.displayName = args.displayName;
    }
    if (args.photoURL !== undefined) {
      updates.photoURL = args.photoURL;
    }

    await ctx.db.patch(user._id, updates);

    console.log(`User profile updated: ${args.userId}`);
    return { success: true, userId: args.userId };
  },
});

/**
 * Get user by Firebase UID
 */
export const getUserByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get current user's full profile
 * In production, this would use authenticated context
 */
export const getCurrentUser = query({
  args: { userId: v.string() },
  handler: async (ctx: any, args: any) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});
