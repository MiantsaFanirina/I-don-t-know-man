import {Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import {styles} from "@/styles/feed.styles";
import {Link} from "expo-router";
import {Image} from "expo-image";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {Id} from "@/convex/_generated/dataModel";
import {useState} from "react";
import {toggleLike} from "@/convex/posts";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";

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
    const [likesCount, setLikesCount] = useState(post.likes)

    const toggleLike = useMutation(api.posts.toggleLike)

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

    // Handle double tap on the Image to handle Like
    let lastTap = Date.now();
    const handleDoubleTap = async () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 1000;
        if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
            await handleLike()
        } else {
            lastTap = now;
        }
    }


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

                {/*todo : only if the user is owner then add delete button*/}
                {/*<TouchableOpacity>*/}
                {/*    <Ionicons name={"ellipsis-horizontal"} size={20} color={COLORS.white}/>*/}
                {/*</TouchableOpacity>*/}


                <TouchableOpacity>
                    <Ionicons name={"trash-outline"} size={20} color={COLORS.primary}/>
                </TouchableOpacity>

            </View>

            {/*IMAGE*/}
            <TouchableWithoutFeedback onPress={handleDoubleTap}>
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
                    
                    <TouchableOpacity>
                        <Ionicons name={"chatbubble-outline"} size={22} color={COLORS.white}/>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Ionicons name={"bookmark-outline"} size={22} color={COLORS.white}/>
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

                <TouchableOpacity>
                    <Text style={styles.commentsText}>View all 2 comments</Text>
                </TouchableOpacity>

                <Text style={styles.timeAgo}>
                    2 hours ago
                </Text>
            </View>

        </View>
    );
};

export default Post;