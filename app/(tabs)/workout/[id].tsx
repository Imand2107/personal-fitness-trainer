import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { workoutPlans } from "../../../assets/data/workouts";

// Add color constants at the top after imports
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

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const workout = workoutPlans.find((w) => w.id === id);

  if (!workout) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.description}>{workout.description}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statText}>{workout.duration} min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statText}>{workout.calories} cal</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="barbell-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statText}>
              {workout.difficulty.charAt(0).toUpperCase() +
                workout.difficulty.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment Needed</Text>
        <View style={styles.equipmentContainer}>
          {workout.equipmentNeeded.length > 0 ? (
            workout.equipmentNeeded.map((equipment, index) => (
              <View key={index} style={styles.equipmentCard}>
                <View style={styles.equipmentIconContainer}>
                  <Ionicons
                    name={
                      equipment.toLowerCase().includes("dumbbell")
                        ? "barbell-outline"
                        : equipment.toLowerCase().includes("mat")
                        ? "square-outline"
                        : equipment.toLowerCase().includes("bench")
                        ? "bed-outline"
                        : equipment.toLowerCase().includes("band")
                        ? "infinite-outline"
                        : "fitness-outline"
                    }
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.equipmentText}>{equipment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noEquipmentCard}>
              <View style={styles.noEquipmentIconContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={COLORS.success}
                />
              </View>
              <View style={styles.noEquipmentContent}>
                <Text style={styles.noEquipmentTitle}>
                  No Equipment Required
                </Text>
                <Text style={styles.noEquipmentSubtitle}>
                  You can do this workout anywhere, anytime!
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              {exercise.sets && exercise.reps && (
                <Text style={styles.exerciseDetail}>
                  {exercise.sets} sets × {exercise.reps} reps
                </Text>
              )}
              {exercise.duration && (
                <Text style={styles.exerciseDetail}>
                  {exercise.duration} seconds
                </Text>
              )}
            </View>
            <Text style={styles.exerciseDescription}>
              {exercise.description}
            </Text>
            {exercise.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips:</Text>
                {exercise.tips.map((tip, tipIndex) => (
                  <Text key={tipIndex} style={styles.tipText}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.startSection}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            // @ts-ignore - Known issue with expo-router types
            router.push({
              pathname: "/workout/session/[id]",
              params: { id: workout.id },
            });
          }}
        >
          <Ionicons name="play-circle" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Workout</Text>
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
  header: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.text,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
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
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.text,
  },
  equipmentContainer: {
    marginTop: 8,
  },
  equipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  equipmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  equipmentText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  noEquipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${COLORS.success}10`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  noEquipmentIconContainer: {
    marginRight: 16,
  },
  noEquipmentContent: {
    flex: 1,
  },
  noEquipmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.success,
    marginBottom: 4,
  },
  noEquipmentSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  exerciseCard: {
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
  exerciseHeader: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.text,
  },
  exerciseDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.text,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  startSection: {
    padding: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
});
