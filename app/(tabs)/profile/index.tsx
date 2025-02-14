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
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#007AFF",
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
    color: "#fff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  goalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  goalType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  goalTarget: {
    color: "#666",
    marginTop: 4,
  },
  goalDeadline: {
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  editButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
