import {FlatList, Text, View} from "react-native";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Loader from "@/components/loader";
import {COLORS} from "@/constants/theme";
import {styles} from "@/styles/notifications.styles";
import {Ionicons} from "@expo/vector-icons";
import Notification from "@/components/notification";

const NoNotificationsFound = () => (
    <View
        style={[styles.container, styles.centered]}
    >
        <Ionicons name={"notifications-outline"} size={48} color={COLORS.grey}/>
        <Text style={{fontSize: 16, color: COLORS.grey, marginTop: 6}}>No notifications yet</Text>
    </View>
)

const Notifications = () => {

    // Query
    const notifications = useQuery(api.notifications.getNotification)

    if (!notifications) return <Loader/>
    if (notifications.length === 0) return <NoNotificationsFound/>

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item._id}
                renderItem={({item}) => <Notification notification={item}/>}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />

        </View>
    );
};

export default Notifications;