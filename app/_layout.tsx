import {Slot, Stack} from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo'
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";
import { tokenCache } from '@clerk/clerk-expo/token-cache'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout() {

  return (
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
          <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                  <Stack screenOptions={{ headerShown: false }}/>
              </SafeAreaView>
          </SafeAreaProvider>
      </ClerkProvider>
  );
}

