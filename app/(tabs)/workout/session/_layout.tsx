import { Stack } from "expo-router";

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: "modal",
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
