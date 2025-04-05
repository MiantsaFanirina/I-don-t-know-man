import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {router, useLocalSearchParams} from "expo-router";
import {Doc, Id} from "@/convex/_generated/dataModel";
import Loader from "@/components/loader";
import {TouchableOpacity, View, Text, ScrollView, Pressable, FlatList, Modal} from "react-native";
import {styles} from "@/styles/profile.styles";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {Image} from "expo-image";
import {useState} from "react";

const NoPostsFound = () => (
    <View
        style={{
            flex: 1,
            paddingVertical: 48,
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <Ionicons name={"images-outline"} size={48} color={COLORS.grey}/>
        <Text style={{fontSize: 16, color: COLORS.grey, paddingTop: 6}}>No posts yet</Text>
    </View>
)

const UserProfileScreen = () => {

    const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null)

    const { id } = useLocalSearchParams()

    // QUERIES AND MUTATIONS
    const profile = useQuery(api.users.getUserProfile, {id: id as Id<'users'>})
    const posts = useQuery(api.posts.getPostByUser, {userId: id as Id<'users'>})
    const isFollowing = useQuery(api.users.isFollowing, {followingId: id as Id<'users'>})
    const toggleFollow = useMutation(api.users.toggleFollow)

    const handleBack = () => {
        if(router.canGoBack()) router.back()
        else router.replace("/(tabs)")
    }

    if(profile === undefined || posts === undefined || isFollowing === undefined) return <Loader/>

    return (
        <View style={styles.container}>

            {/*HEADER*/}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
                    <Ionicons name={"arrow-back"} size={24} color={COLORS.white}/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{profile.username}</Text>
                <View style={{width: 24}}/>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>
                    <View style={styles.avatarAndStats}>

                        {/*AVATAR*/}
                        <Image
                            source={profile.image}
                            style={styles.avatar}
                            contentFit={"cover"}
                            cachePolicy={"memory-disk"}
                        />

                        {/*STATS*/}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile.posts}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile.followers}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile.following}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>

                    </View>

                    {/*USER INFO*/}
                    <Text style={styles.name}>{profile.fullname}</Text>
                    {profile.bio && (<Text style={styles.bio}>{profile.bio}</Text> )}

                    {/*ACTION SECTION*/}
                    <Pressable
                        style={[styles.followButton, isFollowing && styles.followingButton]}
                        onPress={ () => toggleFollow({ followingId: id as Id<'users'> })}
                    >
                        <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </Text>
                    </Pressable>

                </View>

                {/*POST SECTION*/}
                <View style={styles.postsGrid}>

                    {posts.length === 0 ? <NoPostsFound/> : (
                        <FlatList
                            data={posts}
                            numColumns={3}
                            scrollEnabled={false}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
                                    <Image
                                        source={item.imageUrl}
                                        style={styles.gridImage}
                                        contentFit={"cover"}
                                        transition={200}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )}

                </View>

            </ScrollView>

            {/*SELECTED IMAGE MODAL*/}
            <Modal
                visible={!!selectedPost}
                animationType={"fade"}
                transparent={true}
                onRequestClose={() => setSelectedPost(null)}
            >
                <View style={styles.modalBackdrop}>
                    {selectedPost && (
                        <View style={styles.postDetailContainer}>
                            <View style={styles.postDetailHeader}>
                                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                                    <Ionicons name={"close"} size={24} color={COLORS.white}/>
                                </TouchableOpacity>
                            </View>


                            <Image
                                source={selectedPost.imageUrl}
                                cachePolicy={"memory-disk"}
                                style={styles.postDetailImage}
                            />
                        </View>
                    )}
                </View>
            </Modal>

        </View>
    );
};

export default UserProfileScreen;