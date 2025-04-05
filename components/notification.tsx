import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "@/styles/notifications.styles";
import {Link} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {Image} from "expo-image";
import {formatDistanceToNow} from "date-fns";

const Notification = ({notification}: any) => {
    return (
        <View style={styles.notificationItem}>
            <View style={styles.notificationContent}>

                {/*NOTIFICATION DETAILS*/}
                {/*todo : fix href*/}
                <Link href={`/user/${notification.sender._id}`} asChild={true}>
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={notification.sender.image}
                            style={styles.avatar}
                            contentFit={"cover"}
                            transition={200}
                        />

                        <View style={styles.iconBadge}>
                            {
                                notification.type === "like" ?
                                    <Ionicons name={"heart"} size={14} color={COLORS.primary}/>
                                : notification.type === "follow" ?
                                    <Ionicons name={"person-add"} size={14} color={"#8B5CF6"}/>
                                :
                                    <Ionicons name={"chatbubble"} size={14} color={"#3B82F6"}/>
                            }
                        </View>
                    </TouchableOpacity>
                </Link>
                <View style={styles.notificationInfo}>
                    {/*todo : fix href*/}
                    <Link href={'/notifications'} asChild={true}>
                        <TouchableOpacity>
                            <Text style={styles.username}>{notification.sender.username}</Text>
                        </TouchableOpacity>
                    </Link>

                    <Text style={styles.action}>

                        {
                            notification.type === "like" ?
                                "liked you post"
                            : notification.type === "follow" ?
                                "started following you"
                            :
                                `commented: "${notification.comment}"`
                        }
                    </Text>

                    <Text style={styles.timeAgo}>
                        {formatDistanceToNow(notification._creationTime, {addSuffix: true})}
                    </Text>

                </View>

            </View>

            {/*IMAGE RELATED TO POST*/}
            {notification.post && (
                <Image
                    source={notification.post.imageUrl}
                    style={styles.postImage}
                    contentFit={"cover"}
                    transition={200}
                />
            )}

        </View>
    );
};

export default Notification;