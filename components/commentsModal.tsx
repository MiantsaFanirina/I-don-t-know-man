import {FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Id} from "@/convex/_generated/dataModel";
import {useState} from "react";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {styles} from "@/styles/feed.styles";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import Loader from "@/components/loader";
import Comment from "@/components/comment";

type CommentsModalProps = {
    postId: Id<"posts">,
    visible: boolean,
    onClose: () => void,
    onCommentAdded: () => void,
}

const CommentsModal = ({postId, visible, onClose, onCommentAdded} : CommentsModalProps) => {
    const [newComment, setNewComment] = useState("")

    const comments = useQuery(api.comments.getComments, { postId })
    const addComment = useMutation(api.comments.addComment)


    const handleAddComment = async () => {
        if (!newComment.trim()) return

        try {
            await addComment({
                content: newComment,
                postId
            })

            setNewComment("")
            onCommentAdded()
        }
        catch (e) {
            console.error("Failed to add comment:", e)
        }
    }

    return (
        <Modal visible={visible} animationType={"slide"} transparent={true} onRequestClose={onClose}>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalContainer}
            >

                {/*MODAL HEADER*/}
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name={"close"} size={24} color={COLORS.white} />
                    </TouchableOpacity>
                   <Text style={styles.modalTitle}>Comments</Text>
                    <View style={{width: 24}}/>
                </View>

                {/*COMMENTS DISPLAY*/}
                {comments === undefined ? (
                    <Loader/>
                ) : (
                    <FlatList
                        data={comments}
                        keyExtractor={(item) => item._id}
                        renderItem={({item}) => <Comment comment={item}/>}
                        contentContainerStyle={styles.commentsList}
                    />
                )}

                {/*ADD COMMENT FORM*/}
                <View style={styles.commentInput}>

                    <TextInput
                        style={styles.input}
                        placeholder={"Write a comment..."}
                        placeholderTextColor={COLORS.grey}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline={true}
                    />

                    {/*POST BUTTON*/}
                    <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
                        <Text
                            style={[
                                styles.postButton,
                                !newComment.trim() && styles.postButtonDisabled
                            ]}
                        >
                            Post
                        </Text>
                    </TouchableOpacity>

                </View>

            </KeyboardAvoidingView>

        </Modal>
    );
};

export default CommentsModal;