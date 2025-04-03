import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server";
import {v} from "convex/values";
import {ctx} from "expo-router/_ctx";

export const createUser = mutation({
    args: {
        username: v.string(),
        fullname: v.string(),
        image: v.string(),
        email: v.string(),
        bio: v.optional(v.string()),
        clerkId: v.string()
    },
    handler: async(ctx, args) => {

        // Check if a user is already existing
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id",
                (q) => q.eq("clerkId", args.clerkId)
            )
            .first()

        // await ctx.auth.getUserIdentity()
        // exit if a user exist
        if (existingUser) return

        // create user
        await ctx.db.insert("users", {
            username: args.username,
            fullname: args.fullname,
            email: args.email,
            image: args.image,
            bio: args.bio,
            clerkId: args.clerkId,
            followers: 0,
            following: 0,
            posts: 0,
        })
    }
});

export const getAuthenticatedUser = async (ctx: QueryCtx | MutationCtx) => {
    // Check for authentication
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authorized");

    // get the current user
    const currentUser = await ctx.db
        .query("users")
        .withIndex(
            "by_clerk_id",
            (q) => q.eq("clerkId", identity.subject)
        )
        .first()
    if (!currentUser) throw new Error("User not found")
    return currentUser;
}

export const getUserById = query({
    args: {clerkId: v.string()},
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id")
            .first()

    }
})