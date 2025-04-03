import { ScrollView, Text, View} from "react-native";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Loader from "@/components/loader";
import {COLORS} from "@/constants/theme";
import {styles} from "@/styles/feed.styles";
import {Image} from "expo-image";


const NoBookmarksFound = () => (
    <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.background
        }}
    >
        <Text style={{fontSize: 22, color: COLORS.primary}}>No bookmarked posts yet</Text>
    </View>
)

const Bookmarks = () => {

    // Query
    const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts)
    if (!bookmarkedPosts) return <Loader/>
    if(bookmarkedPosts.length === 0) return <NoBookmarksFound/>

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bookmarks</Text>
            </View>

            {/*POSTS*/}
            <ScrollView
                contentContainerStyle={{
                    padding: 8,
                    flexDirection: "row",
                    flexWrap: "wrap"
                }}
            >
                {bookmarkedPosts.map((post) => {
                    if(!post) return null
                    return (
                        <View key={post._id} style={{width: "33.33%", padding: 1}}>
                            <Image
                                source={post.imageUrl}
                                style={{width: "100%", aspectRatio: 1}}
                                contentFit={"cover"}
                                transition={200}
                                cachePolicy={"memory-disk"}
                            />
                        </View>
                    )
                })}
            </ScrollView>

        </View>
    );
};

export default Bookmarks;