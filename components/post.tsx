import {Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {styles} from "@/styles/feed.styles";
import {Link} from "expo-router";
import {Image} from "expo-image";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {Id} from "@/convex/_generated/dataModel";
import {useState} from "react";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import CommentsModal from "@/components/commentsModal";
import {formatDistanceToNow} from "date-fns";
import {useUser} from "@clerk/clerk-expo";

type postProps = {
    post: {
        _id: Id<"posts">;
        imageUrl: string;
        caption?: string;
        likes: number;
        comments: number;
        _creationTime: number;
        isLiked: boolean;
        isBookmarked: boolean;
        author: {
            _id: string;
            username: string;
            image: string;
        };
    }
}

const Post = ({post} : postProps) => {

    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
    const [likesCount, setLikesCount] = useState(post.likes)
    const [commentsCount, setCommentsCount] = useState(post.comments)
    const [showComments, setShowComments] = useState(false)

    // Get currentUser
    const {user} = useUser() // stored in Clerk
    const currentUser = useQuery(api.users.getUserById, user ? {clerkId: user.id} : "skip") // stored in Convex


    // Mutations
    const toggleLike = useMutation(api.posts.toggleLike)
    const toggleBookmark = useMutation(api.bookmarks.toggleBookmark)
    const deletePost = useMutation(api.posts.deletePost)

    const handleLike = async () => {
        try {
            const stateIsLiked = await toggleLike({postId: post._id})
            setIsLiked(stateIsLiked)
            setLikesCount((prev) => (stateIsLiked ? prev + 1 : prev - 1))
        }
        catch (e) {
            console.error("Error toggling like:", e)
        }
    }
    const handleBookmark = async () => {
        const newIsBookmarked = await toggleBookmark({postId: post._id})
        setIsBookmarked(newIsBookmarked)
    }
    const handleDelete = async () => {
        try {
            await deletePost({postId: post._id})
        }
        catch (e) {
            console.error("Error deleting post:", e)
        }
    }

    // Handle taps on the Image: double tap to like, more than 2 tap to bookmark
    let tapCount = 0;
    let tapTimeout: NodeJS.Timeout | null = null;
    const handleTap = async () => {
        tapCount++;

        if (tapTimeout) {
            clearTimeout(tapTimeout);
        }

        tapTimeout = setTimeout(async () => {
            if (tapCount === 2) {
                await handleLike();
            } else if (tapCount > 2) {
                await handleBookmark();
            }
            tapCount = 0;
            tapTimeout = null;
        }, 500); // Adjust timing if necessary
    };

    return (
        <View style={styles.post}>
            {/*POST HEADER*/}
            <View style={styles.postHeader}>

                {/*POST AUTHOR INFO*/}
                <Link href={"/notifications"}>
                    <TouchableOpacity style={styles.postHeaderLeft}>
                        <Image
                            source={post.author.image}
                            style={styles.postAvatar}
                            contentFit={"cover"}
                            transition={200}
                            cachePolicy={"memory-disk"}
                        />
                        <Text style={styles.postUsername}>{post.author.username}</Text>
                    </TouchableOpacity>
                </Link>

                {/*If I'm the owner of the post, show the delete button*/}
                {post.author._id !== currentUser?._id ?
                    <TouchableOpacity>
                        <Ionicons name={"ellipsis-horizontal"} size={20} color={COLORS.white}/>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity onPress={handleDelete}>
                        <Ionicons name={"trash-outline"} size={20} color={COLORS.primary}/>
                    </TouchableOpacity>
                }

            </View>

            {/*IMAGE*/}
            <TouchableWithoutFeedback onPress={handleTap}>
                <Image
                    source={post.imageUrl}
                    style={styles.postImage}
                    contentFit={"cover"}
                    transition={200}
                    cachePolicy={"memory-disk"}
                />
            </TouchableWithoutFeedback>
            {/*POST ACTIONS*/}
            <View style={styles.postActions}>

                <View style={styles.postActionsLeft}>
                    <TouchableOpacity onPress={handleLike}>
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? COLORS.primary : COLORS.white}
                        />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => setShowComments(true)}>
                        <Ionicons name={"chatbubble-outline"} size={22} color={COLORS.white}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleBookmark}>
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>

            {/*POST INFO*/}
            {/*todo : fix raw text*/}
            <View style={styles.postInfo}>
                <Text style={styles.likesText}>
                    {likesCount > 0 ? `${likesCount.toLocaleString()} likes` : "Be the first to like"}
                </Text>
                {post.caption && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionUsername}>{post.author.username}</Text>
                        <Text style={styles.captionText}>{post.caption}</Text>
                    </View>
                )}

                {commentsCount > 0 && (
                    <TouchableOpacity>
                        <Text style={styles.commentsText}>
                            View all {commentsCount} comments
                        </Text>
                    </TouchableOpacity>
                )}


                <Text style={styles.timeAgo}>
                    {formatDistanceToNow(post._creationTime, {addSuffix: true})}
                </Text>
            </View>
            <CommentsModal
                postId={post._id}
                visible={showComments}
                onClose={() => setShowComments(false)}
                onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
            />
        </View>
    );
};

export default Post;