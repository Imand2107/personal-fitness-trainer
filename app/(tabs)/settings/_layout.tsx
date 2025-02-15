import { Stack } from "expo-router";
import { COLORS } from "../../../constants/Colors";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: "Notifications",
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.card,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: true,
          title: "Privacy",
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.card,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerShown: true,
          title: "About",
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.card,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerShown: true,
          title: "Help & Support",
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.card,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
    </Stack>
  );
}
