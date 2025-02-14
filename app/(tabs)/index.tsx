import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../src/services/auth";
import { getUserWorkouts } from "../../src/services/workout";
import { getLatestProgress } from "../../src/services/progress";
import { User, Workout, Progress, GoalType } from "../../src/types";

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [latestProgress, setLatestProgress] = useState<{
    [key in GoalType]?: Progress;
  }>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("(auth)/login");
        return;
      }

      setUser(currentUser);

      // Load recent workouts
      const workouts = await getUserWorkouts(currentUser.uid);
      setRecentWorkouts(workouts.slice(0, 3));

      // Load latest progress for each goal type
      const progressTypes: GoalType[] = ["weight", "strength", "stamina"];
      const progressData: { [key in GoalType]?: Progress } = {};

      for (const type of progressTypes) {
        const progress = await getLatestProgress(currentUser.uid, type);
        if (progress) {
          progressData[type] = progress;
        }
      }

      setLatestProgress(progressData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.profile.name}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("workouts/new")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("progress/record")}
        >
          <Ionicons name="analytics-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Record Progress</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={styles.workoutCard}
              onPress={() => router.push(`workouts/${workout.id}`)}
            >
              <Text style={styles.workoutDate}>
                {workout.date.toDate().toLocaleDateString()}
              </Text>
              <Text style={styles.workoutExercises}>
                {workout.exercises.length} exercises
              </Text>
              {workout.completed && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent workouts</Text>
        )}
      </View>

      {/* Progress Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Summary</Text>
        {Object.entries(latestProgress).map(([type, progress]) => (
          <View key={type} style={styles.progressCard}>
            <Text style={styles.progressType}>{type}</Text>
            <Text style={styles.progressValue}>{progress.value}</Text>
            <Text style={styles.progressDate}>
              {progress.date.toDate().toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "#007AFF",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  quickActions: {
    flexDirection: "row",
    padding: 20,
    justifyContent: "space-around",
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    width: "45%",
  },
  actionText: {
    marginTop: 8,
    color: "#007AFF",
    fontWeight: "500",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  workoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutDate: {
    fontWeight: "500",
  },
  workoutExercises: {
    color: "#666",
  },
  progressCard: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  progressType: {
    textTransform: "capitalize",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  progressDate: {
    color: "#666",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },
});
