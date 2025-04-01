import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "@/styles/feed.styles";
import {Link} from "expo-router";
import {Image} from "expo-image";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";

// todo : add the actual type
const Post = ({post} : {post:any}) => {
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
            <Image
                source={post.imageUrl}
                style={styles.postImage}
                contentFit={"cover"}
                transition={200}
                cachePolicy={"memory-disk"}
            />

            {/*POST ACTIONS*/}
            <View style={styles.postActions}>

                <View style={styles.postActionsLeft}>
                    <TouchableOpacity>
                        <Ionicons name={"heart-outline"} size={24} color={COLORS.white}/>
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
                    Be the first to like
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