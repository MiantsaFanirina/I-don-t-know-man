import {View, Text} from "react-native";
import {styles} from "@/styles/auth.style";
import {Link} from "expo-router";


const Index = () => {
    return (
        <View style={styles.container}>
            <Link href={"/notifications"}>Visit notifications screen</Link>
        </View>
    );
};





export default Index;