import { Stack } from "expo-router";

const COLORS = {
  primary: "#FF6B6B",
  primaryDark: "#E85D5D",
  primaryLight: "#FF8787",
  background: "#FFF9F9",
  card: "#FFFFFF",
  text: "#2D3436",
};

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.card,
        headerTitleStyle: {
          fontWeight: "600",
        },
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
        name="edit"
        options={{
          title: "Edit Profile",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
