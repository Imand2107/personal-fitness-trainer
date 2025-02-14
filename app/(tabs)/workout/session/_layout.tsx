import { Stack } from "expo-router";

const COLORS = {
  primary: "#FF6B6B",
  background: "#FFF9F9",
  card: "#FFFFFF",
};

export default function SessionLayout() {
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
        presentation: "modal",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Workout Session",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
