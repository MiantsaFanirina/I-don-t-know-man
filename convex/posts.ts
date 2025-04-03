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
                const postAuthor = (await ctx.db.get(post.userId))!


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

export const toggleLike = mutation({
    args: {
        postId: v.id("posts")
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)

        const existing = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) => (
                q.eq("userId", currentUser._id).eq("postId", args.postId)
            ))
            .first()

        const post = await ctx.db.get(args.postId)
        if (!post) throw new Error("Post not found")

        if(existing) {
            // remove the like
            await ctx.db.delete(existing._id)
            await ctx.db.patch(args.postId, { likes: post.likes - 1 })
            return false
        }
        else {
            // add like
            await ctx.db.insert("likes", {
                userId: currentUser._id,
                postId: args.postId
            })
            await ctx.db.patch(args.postId, { likes: post.likes + 1 })

            // if not the owner post -> create notification
            if (currentUser._id !== post.userId) {
                await ctx.db.insert("notifications", {
                    receiverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId
                })
            }

            return true
        }

    }
})

export const deletePost = mutation({
    args: {postId: v.id("posts")},
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx)

        const post = await ctx.db.get(args.postId)
        if(!post) throw new Error("Post not found")

        // verify ownership
        if (post.userId !== currentUser._id) throw new Error("Not authorized to delete this post")

        // delete all associated likes
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect()
        for (const like of likes) {
            await ctx.db.delete(like._id)
        }

        // deleted associated comments
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect()
        for (const comment of comments) {
            await ctx.db.delete(comment._id)
        }

        // delete associated bookmarks
        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect()
        for (const bookmark of bookmarks) {
            await ctx.db.delete(bookmark._id)
        }

        // delete the image from the storage
        await ctx.storage.delete(post.storage)

        // delete the post
        await ctx.db.delete(args.postId)

        // decrement user's post count by 1
        await ctx.db.patch(currentUser._id, {
            posts: Math.max(0, (currentUser.posts || 1) - 1) // post always be 0 at minimum
        })
    }
})