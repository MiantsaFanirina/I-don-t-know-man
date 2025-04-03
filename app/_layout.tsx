import {SplashScreen, Stack} from 'expo-router';
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";
import ClerkConvexProvider from "@/providers/ClerkConvexProvider";
import {useFonts} from "expo-font";
import {useCallback} from "react";

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const fontsLoaded = useFonts({
        "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
    })

    const onLayoutRootView = useCallback(async () => {
        if(fontsLoaded) await SplashScreen.hideAsync()
    }, [fontsLoaded])

    return (
        <ClerkConvexProvider>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} onLayout={onLayoutRootView}>
                    <Stack screenOptions={{ headerShown: false }}/>
                </SafeAreaView>
            </SafeAreaProvider>
        </ClerkConvexProvider>
    );
}

