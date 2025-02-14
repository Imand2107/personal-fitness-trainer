import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { subscribeToAuthChanges } from "../../src/services/auth";

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        // User is signed in, redirect to main app
        router.replace("/(tabs)");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
