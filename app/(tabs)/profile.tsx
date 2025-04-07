import {
    FlatList,
    Keyboard, KeyboardAvoidingView,
    Modal, Platform,
    ScrollView,
    Text, TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { useClerk, useUser} from "@clerk/clerk-expo";
import {useState} from "react";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Doc} from "@/convex/_generated/dataModel";
import Loader from "@/components/loader";
import {styles} from "@/styles/profile.styles";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {Image} from "expo-image";

const NoPostsFound = () => (
    <View
        style={{
            height: "100%",
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <Ionicons name={"images-outline"} size={48} color={COLORS.grey}/>
        <Text style={{fontSize: 16, color: COLORS.grey, paddingTop: 6}}>No posts yet</Text>
    </View>
)

const Profile = () => {
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

    const {signOut} = useClerk()
    const {user} = useUser()
    if(!user) throw new Error("User does not exist");

    const userId = user.id

    // QUERIES & MUTATIONS
    const currentUser = useQuery(api.users.getUserById, userId ? {clerkId: userId} : "skip")
    if (!currentUser) throw new Error("User does not exist");
    const posts = useQuery(api.posts.getPostByUser, {})
    const updateProfile = useMutation(api.users.updateProfile)

    // USER INFO STATE
    const [editedProfile, setEditedProfile] = useState({
        fullname: currentUser?.fullname || "",
        bio: currentUser?.bio || "",
    })

    // POST RELATED STATE
    const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null)

    const handleSaveProfile = async () => {
        try {
            await updateProfile(editedProfile)
        }
        catch (e) {
            console.error("Failed to edit profile", e)
        }
        setIsEditModalVisible(false);
    }


    if(!currentUser || posts === undefined) return <Loader/>


    return (
        <View style={styles.container}>

            {/*HEADER*/}
            <View style={styles.header}>

                <View style={styles.headerLeft}>
                    <Text style={styles.username}>{currentUser.username}</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
                        <Ionicons name={"log-out-outline"} size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>

                    {/*AVATAR AND STATS*/}
                    <View style={styles.avatarAndStats}>
                        
                        {/*AVATAR */}
                        <View style={styles.avatarContainer}>
                            <Image
                                source={currentUser.image}
                                style={styles.avatar}
                                contentFit={"cover"}
                                transition={200}
                            />
                        </View>

                        {/*STATS*/}
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>

                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentUser.following}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>

                    </View>

                    {/*USER INFO*/}
                    <Text style={styles.name}>{currentUser.fullname}</Text>
                    {currentUser.bio && (<Text style={styles.bio}>{currentUser.bio}</Text> )}

                    {/*ACTION SECTION*/}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>

                        {/*todo : Add functionality later*/}
                        <TouchableOpacity style={styles.shareButton}>
                            <Ionicons name={"share-outline"} size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                </View>

                {posts.length === 0 && (<NoPostsFound/>)}
                
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

            </ScrollView>

            {/*EDIT PROFILE MODAL*/}
            <Modal
                visible={isEditModalVisible}
                animationType={"slide"}
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalContent}>

                            {/*HEADER*/}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                                    <Ionicons name={"close"} size={24} color={COLORS.white} />
                                </TouchableOpacity>
                            </View>

                            {/*NAME INPUT*/}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editedProfile.fullname}
                                    onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, fullname: text }))}
                                    placeholderTextColor={COLORS.grey}
                                    placeholder={"Edit your name"}
                                />
                            </View>

                            {/*BIO INPUT*/}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.bioInput]}
                                    value={editedProfile.bio}
                                    onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, bio: text }))}
                                    placeholderTextColor={COLORS.grey}
                                    multiline={true}
                                    numberOfLines={4}
                                    placeholder={"Add a Bio"}
                                />
                            </View>

                            {/*SAVE BUTTON*/}
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                                <Text style={styles.saveButtonText}>Save changes</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>

            </Modal>


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

export default Profile;