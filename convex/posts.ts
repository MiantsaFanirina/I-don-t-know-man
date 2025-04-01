import {mutation, query} from "./_generated/server";
import {v} from "convex/values";
import {getAuthenticatedUser} from "./users";

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
        // Get authenticated User
        const currentUser = await getAuthenticatedUser(ctx)

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

export const getFeedPost = query({
    handler: async (ctx) => {
        // Get authenticated User
        const currentUser = await getAuthenticatedUser(ctx)

        // Get all posts
        const posts = await ctx.db.query("posts").order("desc").collect()
        if (posts.length === 0) return []

        // Enhance posts with user data and interaction status
        return await Promise.all(
            posts.map(async (post) => {
                const postAuthor = await ctx.db.get(post.userId)


                const like = await ctx.db.query("likes")
                    .withIndex(
                        "by_user_and_post",
                        (q) => q.eq("userId", currentUser._id).eq("postId", post._id)
                    )
                    .first()

                const bookmark = await ctx.db.query("bookmarks")
                    .withIndex(
                        "by_user_and_post",
                        (q) => q.eq("userId", currentUser._id).eq("postId", post._id)
                    )
                    .first()

                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image
                    },
                    isLiked: !!like,
                    isBookmarked: !!bookmark,
                }

            })
        );

    }
})