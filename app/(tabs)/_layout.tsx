import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

const COLORS = {
  primary: "#FF6B6B",
  primaryDark: "#E85D5D",
  primaryLight: "#FF8787",
  background: "#FFF9F9",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#FFE5E5",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 110 : 90,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          shadowColor: COLORS.text,
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
