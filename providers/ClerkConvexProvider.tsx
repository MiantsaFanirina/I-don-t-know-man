import {tokenCache} from "@clerk/clerk-expo/token-cache";
import {ClerkLoaded, ClerkProvider, useAuth} from "@clerk/clerk-expo";
import {ConvexProviderWithClerk} from "convex/react-clerk";
import {ConvexReactClient} from "convex/react";
import {ReactNode} from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
});

const ClerkConvexProvider = ({children}: {children: ReactNode}) => {
    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <ClerkLoaded>
                    {children}
                </ClerkLoaded>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
};

export default ClerkConvexProvider;