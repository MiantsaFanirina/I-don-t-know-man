import {View, Text, TouchableOpacity} from "react-native";
import {styles} from "@/styles/auth.style";
import {Link} from "expo-router";
import {useAuth} from "@clerk/clerk-expo";


const Index = () => {
    const {signOut} = useAuth()
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => signOut()}>
                <Text style={{color: "white"}}>
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
};





export default Index;