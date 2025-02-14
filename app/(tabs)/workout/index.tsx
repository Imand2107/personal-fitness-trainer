import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "../../../src/services/auth";
import { User, Goal } from "../../../src/types";
import { workoutPlans } from "../../../assets/data/workouts";

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

export default function WorkoutScreen() {
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

  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case "weight":
        return "scale-outline";
      case "strength":
        return "barbell-outline";
      case "stamina":
        return "pulse-outline";
      default:
        return "fitness-outline";
    }
  };

  const getRecommendedWorkouts = () => {
    if (!user?.goals?.[0]?.type) return [];
    return workoutPlans.filter(
      (workout) => workout.goalType === user.goals[0].type
    );
  };

  const formatDeadline = (deadline: any) => {
    if (!deadline) return "No deadline set";
    const date = deadline.toDate();
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const recommendedWorkouts = getRecommendedWorkouts();
  const currentGoal = user?.goals?.[0];

  return (
    <ScrollView style={styles.container}>
      {/* Current Goal Section */}
      <View style={styles.goalSection}>
        <Text style={styles.sectionTitle}>Current Goal</Text>
        {currentGoal ? (
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons
                name={getGoalIcon(currentGoal.type)}
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.goalType}>
                {currentGoal.type.charAt(0).toUpperCase() +
                  currentGoal.type.slice(1)}
              </Text>
            </View>
            <Text style={styles.goalDeadline}>
              Target Date: {formatDeadline(currentGoal.deadline)}
            </Text>
          </View>
        ) : (
          <Text style={styles.noGoal}>No goal set</Text>
        )}
      </View>

      {/* Recommended Workouts Section */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Recommended Workouts</Text>
        {recommendedWorkouts.length > 0 ? (
          recommendedWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => {
                // @ts-ignore - Known issue with expo-router types
                router.push({
                  pathname: "(tabs)/workout/[id]",
                  params: { id: workout.id },
                });
              }}
            >
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDescription}>
                  {workout.description}
                </Text>
                <View style={styles.workoutDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.detailText}>
                      {workout.duration} min
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="flame-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.detailText}>
                      {workout.calories} calories
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="speedometer-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.detailText}>
                      {workout.difficulty.charAt(0).toUpperCase() +
                        workout.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noWorkouts}>
            No workouts available for your goal type
          </Text>
        )}
      </View>

      {/* Quick Start Section */}
      <View style={styles.quickStartSection}>
        <TouchableOpacity
          style={styles.quickStartButton}
          // @ts-ignore - Known issue with expo-router types
          onPress={() => router.push("(tabs)/workout/quick-start")}
        >
          <Ionicons name="play" size={24} color="#fff" />
          <Text style={styles.quickStartText}>Quick Start Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  goalSection: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: COLORS.text,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalType: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: COLORS.text,
  },
  goalDeadline: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  noGoal: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  workoutsSection: {
    padding: 20,
  },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text,
  },
  workoutDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  noWorkouts: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 20,
  },
  quickStartSection: {
    padding: 20,
    paddingTop: 0,
  },
  quickStartButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickStartText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
});
