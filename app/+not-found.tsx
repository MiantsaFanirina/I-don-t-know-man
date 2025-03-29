import {Text, View} from "react-native";
import {Link} from "expo-router";

const NotFound = () => {
    return (
        <View>
            <Link href={'/'}>
                <Text>Go home</Text>
            </Link>
        </View>
    );
};

export default NotFound;