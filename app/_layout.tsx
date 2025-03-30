import {Slot, Stack} from 'expo-router';
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";
import ClerkConvexProvider from "@/providers/ClerkConvexProvider";


export default function RootLayout() {

  return (
      <ClerkConvexProvider>
          <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                  <Stack screenOptions={{ headerShown: false }}/>
              </SafeAreaView>
          </SafeAreaProvider>
      </ClerkConvexProvider>
  );
}

