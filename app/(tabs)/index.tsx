import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../src/services/auth";
import { getUserWorkouts } from "../../src/services/workout";
import { getLatestProgress } from "../../src/services/progress";
import { User, Workout, Progress, GoalType } from "../../src/types";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [latestProgress, setLatestProgress] = useState<{
    [key in GoalType]?: Progress;
  }>({});
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("/(auth)/login");
        return;
      }

      setUser(currentUser);

      // Load recent workouts and calculate streak
      const workouts = await getUserWorkouts(currentUser.uid);
      setRecentWorkouts(workouts.slice(0, 3));

      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sortedWorkouts = workouts
        .filter((w) => w.completed)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis());

      let lastWorkoutDate = today;
      for (const workout of sortedWorkouts) {
        const workoutDate = workout.date.toDate();
        workoutDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (lastWorkoutDate.getTime() - workoutDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
          currentStreak++;
          lastWorkoutDate = workoutDate;
        } else {
          break;
        }
      }
      setStreak(currentStreak);

      // Calculate total exercise minutes
      const totalMins = workouts
        .filter((w) => w.completed)
        .reduce((acc, workout) => {
          const workoutDuration = workout.exercises.reduce(
            (sum, exercise) => sum + (exercise.duration || 0),
            0
          );
          return acc + Math.floor(workoutDuration / 60);
        }, 0);
      setTotalMinutes(totalMins);

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

  const calculateGoalProgress = (goalType: GoalType): number => {
    if (!user?.goals || !user.goals.length) return 0;
    const goal = user.goals.find((g) => g.type === goalType);
    if (!goal || !latestProgress[goalType]) return 0;

    return Math.min(
      Math.round((latestProgress[goalType]!.value / goal.target) * 100),
      100
    );
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

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color="#30B0C7" />
          <Text style={styles.statValue}>{totalMinutes}</Text>
          <Text style={styles.statLabel}>Total Minutes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text style={styles.statValue}>
            {recentWorkouts.filter((w) => w.completed).length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Goal Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goal Progress</Text>
        {user?.goals?.map((goal) => (
          <View key={goal.type} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalType}>
                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
              </Text>
              <Text style={styles.goalProgress}>
                {calculateGoalProgress(goal.type)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculateGoalProgress(goal.type)}%` },
                ]}
              />
            </View>
            <Text style={styles.goalDeadline}>
              Target: {goal.deadline.toDate().toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/workout")}
        >
          <Ionicons name="play-circle" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(tabs)/profile/edit")}
        >
          <Ionicons name="analytics" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Update Goals</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/workout")}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map((workout, index) => (
            <TouchableOpacity
              key={index}
              style={styles.workoutCard}
              onPress={() => router.push(`/(tabs)/workout/${workout.id}`)}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDate}>
                  {workout.date.toDate().toLocaleDateString()}
                </Text>
                <Text style={styles.workoutExercises}>
                  {workout.exercises.length} exercises
                </Text>
              </View>
              {workout.completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </View>
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
            <View style={styles.progressHeader}>
              <Ionicons
                name={
                  type === "weight"
                    ? "scale"
                    : type === "strength"
                    ? "barbell"
                    : "pulse"
                }
                size={24}
                color="#007AFF"
              />
              <Text style={styles.progressType}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginTop: -20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAllButton: {
    color: "#007AFF",
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  goalType: {
    fontSize: 16,
    fontWeight: "600",
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E9ECEF",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  goalDeadline: {
    fontSize: 12,
    color: "#666",
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
  workoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontWeight: "500",
    fontSize: 16,
    marginBottom: 4,
  },
  workoutExercises: {
    color: "#666",
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 4,
  },
  progressCard: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressType: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    textTransform: "capitalize",
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  progressDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    fontStyle: "italic",
  },
});
