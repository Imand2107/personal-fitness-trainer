import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: "modal",
        headerStyle: {
          backgroundColor: "#FF6B6B",
        },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "Workout Session",
        }}
      />
    </Stack>
  );
}
