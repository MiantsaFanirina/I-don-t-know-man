import {ActivityIndicator, View} from "react-native";
import {COLORS} from "@/constants/theme";

const Loader = () => {
    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.background
        }}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
        </View>
    );
};

export default Loader;