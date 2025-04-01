import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text, TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useRouter} from "expo-router";
import {useUser} from "@clerk/clerk-expo";
import {useState} from "react";
import {styles} from "@/styles/create.styles";
import {COLORS} from "@/constants/theme";
import {Ionicons} from "@expo/vector-icons";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import {Image} from "expo-image";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Id} from "@/convex/_generated/dataModel";

const CreateScreen = () => {
    const router = useRouter()
    const {user} = useUser()

    // states
    const [caption, setCaption] = useState<string>("")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isSharing, setIsSharing] = useState(false)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if(!result.canceled) setSelectedImage(result.assets[0].uri)
    }


    // share post
    const generateUploadUrl = useMutation(api.posts.generateUploadUrl)
    const createPost = useMutation(api.posts.createPost)
    const handleShare = async () => {
        if (!selectedImage) return
        try {
            setIsSharing(true)
            const uploadUrl = await generateUploadUrl()

            const uploadResult = await FileSystem.uploadAsync(uploadUrl, selectedImage, {
                httpMethod: "POST",
                uploadType:FileSystem.FileSystemUploadType.BINARY_CONTENT,
                mimeType: "image/jpeg",
            })

            if (uploadResult.status !== 200) throw new Error("Failed to upload file")

            const result = JSON.parse(uploadResult.body)
            const storage = result.storageId
            console.log(storage)

            await createPost({storage: storage, caption: caption})

            router.push("/(tabs)")
        }
        catch (e) {
            console.log("Error sharing posts:")
        }finally {
            setIsSharing(false)
        }
    }


    // UI if no image selected
    if(!selectedImage) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name={'arrow-back'} size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New post</Text>
                    <View style={{width: 28}}/>
                </View>

                <TouchableOpacity style={styles.emptyImageContainer} onPress={pickImage}>
                    <Ionicons name={"image-outline"} size={48} color={COLORS.grey} />
                    <Text style={styles.emptyImageText}>Tap to select an image</Text>
                </TouchableOpacity>

            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >

            {/*HEADER*/}
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedImage(null)
                        setCaption("")
                    }}
                    disabled={isSharing}
                >
                    <Ionicons name={"close-outline"} size={28} color={isSharing ? COLORS.grey : COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <TouchableOpacity
                    style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
                    disabled={isSharing || !selectedImage}
                    onPress={handleShare}
                >
                    {isSharing ? (
                        <ActivityIndicator size={"small"} color={COLORS.primary} />
                    ): (
                        <Text style={styles.shareText}>Share</Text>
                    )}

                </TouchableOpacity>
            </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                keyboardShouldPersistTaps={"handled"}
                contentOffset={{x: 0, y: 100}}
            >
                <View
                    style={[styles.content, isSharing && styles.contentDisabled]}
                >

                    {/*IMAGE SECTION*/}
                    <View style={styles.imageSection}>
                        <Image
                            source={selectedImage}
                            style={styles.previewImage}
                            contentFit={"cover"}
                            transition={200}
                        />
                        <TouchableOpacity
                         style={styles.changeImageButton}
                         onPress={pickImage}
                         disabled={isSharing}
                        >
                            <Ionicons name={"image-outline"} size={28} color={COLORS.white} />
                            <Text style={styles.changeImageText}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    {/*INPUT SECTION*/}
                    <View style={styles.inputSection}>
                        <View style={styles.captionContainer}>
                            <Image
                                source={user?.imageUrl}
                                style={styles.userAvatar}
                                contentFit={"cover"}
                                transition={200}
                            />

                            <TextInput
                                style={styles.captionInput}
                                placeholder={"Write a caption..."}
                                placeholderTextColor={COLORS.grey}
                                multiline={true}
                                value={caption}
                                onChangeText={setCaption}
                                editable={!isSharing}
                            />

                        </View>
                    </View>

                </View>

            </ScrollView>

        </KeyboardAvoidingView>
    );
};

export default CreateScreen;