import {mutation} from "./_generated/server";
import {v} from "convex/values";

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
        const existingUser = await ctx.db.query("users")
            .withIndex("by_clerk_id",
                (q) => q.eq("clerkId", args.clerkId)
            )
            .first()
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
