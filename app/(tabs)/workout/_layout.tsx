import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Workouts",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Workout Details",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="quick-start"
        options={{
          title: "Quick Start",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="session"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
