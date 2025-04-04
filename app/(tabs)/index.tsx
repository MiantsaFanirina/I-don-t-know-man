import {View, Text, TouchableOpacity, FlatList} from "react-native";
import {styles} from "@/styles/feed.styles";
import {useAuth} from "@clerk/clerk-expo";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/constants/theme";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Loader from "@/components/loader";
import Post from "@/components/post";
import Stories from "@/components/stories";


const NoPostsFound = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <Text style={{fontSize: 20, color: COLORS.primary}}>No posts yet</Text>
    </View>
)


const Index = () => {
    const {signOut} = useAuth()

    // Get all posts
    const posts = useQuery(api.posts.getFeedPost)

    if(posts === undefined) return <Loader/>

    if(posts.length === 0) return <NoPostsFound/>

    return (
        <View style={styles.container}>

            {/*HEADER*/}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Spotlight</Text>
                <TouchableOpacity onPress={() => signOut()}>
                    <Ionicons name={"log-out-outline"} size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>




            {/*POST SECTION*/}
            <FlatList
                data={posts}
                renderItem={({item}) => <Post post={item}/>}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 60}}
                ListHeaderComponent={<Stories/>}
            />

            {/**/}

        </View>
    );
};





export default Index;