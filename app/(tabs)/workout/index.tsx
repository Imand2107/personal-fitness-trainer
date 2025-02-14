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
import { workoutPlans } from "../../../assets/data/workouts";

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  targetMuscles: string[];
  equipment: string[];
  tips: string[];
}

type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  exercises: Exercise[];
  restBetweenExercises: number;
  category: string;
  goalType?: string;
  duration?: number;
  calories?: number;
};

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
};

export default function WorkoutScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API/database
    setWorkouts(workoutPlans as unknown as WorkoutPlan[]);
  }, []);

  const getWorkoutTags = (workout: WorkoutPlan) => {
    const tags: string[] = [];

    // Add category as a tag
    if (workout.category) {
      tags.push(workout.category.replace("_", " "));
    }

    // Add difficulty as a tag
    if (workout.difficulty) {
      tags.push(workout.difficulty);
    }

    // Add goal type as a tag if it exists
    if (workout.goalType) {
      tags.push(workout.goalType);
    }

    // Add duration tag if it exists
    if (workout.duration) {
      tags.push(`${workout.duration}min`);
    }

    // Add calories tag if it exists
    if (workout.calories) {
      tags.push(`${workout.calories}cal`);
    }

    return tags;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Quick Start Section */}
      <View style={styles.quickStartSection}>
        <TouchableOpacity
          style={styles.quickStartButton}
          onPress={() => router.push("/workout/quick-start")}
        >
          <View style={styles.quickStartContent}>
            <Ionicons name="flash" size={24} color={COLORS.primary} />
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitle}>Quick Start</Text>
              <Text style={styles.quickStartSubtitle}>
                Jump into a beginner-friendly workout
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Settings Button */}
      <View style={styles.settingsSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/workout/settings")}
        >
          <View style={styles.settingsContent}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.primary}
            />
            <View style={styles.settingsText}>
              <Text style={styles.settingsTitle}>Workout Settings</Text>
              <Text style={styles.settingsSubtitle}>
                Customize your exercise preferences
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Workout Plans */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Plans</Text>
        {workouts.map((workout, index) => (
          <TouchableOpacity
            key={index}
            style={styles.workoutCard}
            onPress={() => router.push(`/workout/${workout.id}`)}
          >
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>{workout.name}</Text>
              <Text style={styles.workoutSubtitle}>
                {workout.exercises.length} exercises • {workout.difficulty}
              </Text>
              <View style={styles.workoutTags}>
                {getWorkoutTags(workout).map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  quickStartSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  quickStartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickStartContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  quickStartText: {
    marginLeft: 12,
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  settingsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsText: {
    marginLeft: 12,
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.text,
  },
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  workoutTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
