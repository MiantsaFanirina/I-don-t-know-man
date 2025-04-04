import {ScrollView} from "react-native";
import {styles} from "@/styles/feed.styles";
import {STORIES} from "@/constants/mock-data";
import Story from "@/components/story";

const Stories = () => (
    <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
    >
        {STORIES.map((story) => (
            <Story key={story.id} story={story}/>
        ))}
    </ScrollView>
)

export default Stories;
