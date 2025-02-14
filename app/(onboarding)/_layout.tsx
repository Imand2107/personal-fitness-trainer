import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getCurrentUser } from "../../src/services/auth";

export default function OnboardingLayout() {
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/(auth)");
      } else if (user.profile.onboardingCompleted) {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="bmi-setup" options={{ title: "BMI Setup" }} />
      <Stack.Screen
        name="goal-settings"
        options={{ title: "Set Your Goals" }}
      />
      <Stack.Screen
        name="exercise-setup"
        options={{ title: "Choose Exercises" }}
      />
    </Stack>
  );
}
