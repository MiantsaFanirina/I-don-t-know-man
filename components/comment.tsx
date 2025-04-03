import {Image, View, Text} from "react-native";
import {styles} from "@/styles/feed.styles";
import {formatDistanceToNow} from "date-fns"


interface CommentType {
    content: string;
    _creationTime: number;
    user: {
        fullName: string;
        image: string;
    }
}

const Comment = ({comment} : {comment: CommentType}) => {
    return (
        <View style={styles.commentContainer}>

            <Image source={{uri: comment.user.image}} style={styles.commentAvatar}/>

            <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{comment.user.fullName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>
                    {formatDistanceToNow(comment._creationTime, {addSuffix: true})}
                </Text>
            </View>

        </View>
    );
};

export default Comment;