import {mutation, MutationCtx, query, QueryCtx} from "./_generated/server";
import {v} from "convex/values";
import {Id} from "./_generated/dataModel";

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
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first()

    }
})

export const updateProfile = mutation({
    args: {
        fullname: v.string(),
        bio: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)

        await ctx.db.patch(currentUser._id, {
            fullname: args.fullname,
            bio: args.bio
        })

    }
})

export const getUserProfile = query({
    args: {id: v.id("users")},
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id)
        if(!user) throw new Error("User not found")
        return user
    }
})

export const isFollowing = query({
    args: {followingId: v.id("users")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)

        const follow = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
            )
            .first()

        return !!follow
    }
})

const updateFollowCounts = async (
    ctx: MutationCtx,
    followerId: Id<"users">,
    followingId: Id<"users">,
    isFollow: boolean
) => {

    const follower = await ctx.db.get(followerId)
    const following = await ctx.db.get(followingId)

    if(follower && following) {
        await ctx.db.patch(followerId, {
            following: follower.following + (isFollow ? 1 : -1)
        })

        await ctx.db.patch(followingId, {
            followers: following.followers + (isFollow ? 1 : -1)
        })
    }

}

export const toggleFollow = mutation({
    args: {followingId: v.id("users")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)
        const existing = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q.eq("followerId", currentUser._id)
            )
            .first()


        if (existing) {
            // unfollow
            await ctx.db.delete(existing._id)
            await updateFollowCounts (ctx, currentUser._id, args.followingId, false)
        }
        else {

            // follow
            await ctx.db.insert("follows", {
                followingId: args.followingId,
                followerId: currentUser._id
            })
            await updateFollowCounts (ctx, currentUser._id, args.followingId, true)

            // Create a notification
            await ctx.db.insert("notifications", {
                receiverId: args.followingId,
                senderId: currentUser._id,
                type: "follow"
            })

        }

    }
})