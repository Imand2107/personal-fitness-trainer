import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 110 : 90,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarItemStyle: {
          height: Platform.OS === "ios" ? 80 : 70,
          paddingTop: 10,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="home-outline" size={size + 4} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="fitness-outline" size={size + 4} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="person-outline" size={size + 4} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
