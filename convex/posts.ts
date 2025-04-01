import {mutation} from "./_generated/server";
import {v} from "convex/values";

export const generateUploadUrl = mutation(async (ctx) =>{

    // Check for authentication
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authorized");


    return await ctx.storage.generateUploadUrl()
})

export const createPost = mutation({
    args:{
        caption: v.optional(v.string()),
        storage: v.id("_storage"),
    },
    handler: async (ctx, args) => {
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

        // get the image url
        const imageUrl = await ctx.storage.getUrl(args.storage)
        if (!imageUrl) throw new Error("Image not found")

        // Create Post
        const postId = await ctx.db.insert("posts", {
            userId: currentUser._id,
            imageUrl,
            storage: args.storage,
            caption: args.caption,
            likes: 0,
            comments: 0,
        })

        // increments user's post by 1
        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts + 1
        })

        // return the post's id
        return postId


    }
})