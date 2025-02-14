import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../../src/services/auth";
import { User } from "../../../src/types";
import { Timestamp } from "firebase/firestore";

const COLORS = {
  primary: "#FF6B6B",
  primaryDark: "#E85D5D",
  primaryLight: "#FF8787",
  secondary: "#FFB84C",
  success: "#51CF66",
  background: "#FFF9F9",
  card: "#FFFFFF",
  text: "#2D3436",
  textSecondary: "#636E72",
  border: "#FFE5E5",
  divider: "#FFE5E5",
};

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#fff" />
        </View>
        <Text style={styles.name}>{user.profile.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user.profile.age} years</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>
            {user.profile.gender.charAt(0).toUpperCase() +
              user.profile.gender.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Stats</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>{user.profile.height} cm</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{user.profile.weight} kg</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>BMI</Text>
          <Text style={styles.value}>{user.profile.bmi.toFixed(1)}</Text>
        </View>
        {user.profile.bodyType && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Body Type</Text>
            <Text style={styles.value}>
              {user.profile.bodyType.charAt(0).toUpperCase() +
                user.profile.bodyType.slice(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals</Text>
        {user.goals.length > 0 ? (
          user.goals.map((goal, index) => (
            <View key={index} style={styles.goalCard}>
              <View>
                <Text style={styles.goalType}>
                  {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                </Text>
                <Text style={styles.goalTarget}>Target: {goal.target}</Text>
              </View>
              <Text style={styles.goalDeadline}>
                Due: {goal.deadline?.toDate().toLocaleDateString() || "Not set"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No goals set</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => router.push("/(tabs)/profile/edit")}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.card,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: COLORS.card,
    opacity: 0.8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  goalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalType: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  goalTarget: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  goalDeadline: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  editButton: {
    margin: 20,
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "bold",
  },
});
