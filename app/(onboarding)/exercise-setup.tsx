import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../firebase/config";
import { Ionicons } from "@expo/vector-icons";
import { commonExercises } from "../../assets/data/workouts";
import { Exercise as WorkoutExercise, GoalType } from "../../src/types/workout";
import { useAuth } from "../../src/hooks/useAuth";
import { getCurrentUser, updateUserProfile } from "../../src/services/auth";
import { COLORS } from "../../constants/Colors";

// Helper function to get exercise image
const getExerciseImage = (exerciseId: string) => {
  const imageMap: { [key: string]: any } = {
    jumping_jacks: require("../../assets/images/exercises/jumping-jacks.gif"),
    high_knees: require("../../assets/images/exercises/high-knees.gif"),
    mountain_climbers: require("../../assets/images/exercises/mountain-climbers.gif"),
    pushups: require("../../assets/images/exercises/pushup.gif"),
    wide_arm_pushups: require("../../assets/images/exercises/wide-arm-push-up.gif"),
    diamond_pushups: require("../../assets/images/exercises/Diamond_Push-Up.gif"),
    plank: require("../../assets/images/exercises/plank.jpg"),
    russian_twist: require("../../assets/images/exercises/russian-twist.gif"),
    leg_raises: require("../../assets/images/exercises/leg-raises.gif"),
    squats: require("../../assets/images/exercises/squats.gif"),
    lunges: require("../../assets/images/exercises/lunges.gif"),
    burpees: require("../../assets/images/exercises/burpee.webp"),
  };

  return (
    imageMap[exerciseId] || require("../../assets/images/exercises/plank.jpg")
  );
};

export default function ExerciseSetupScreen() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const [userGoal, setUserGoal] = useState<GoalType>("weight");

  useEffect(() => {
    const fetchUserGoal = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        if (currentUser.goals && currentUser.goals.length > 0) {
          setUserGoal(currentUser.goals[0].type);
        }
      } catch (error) {
        console.error("Error fetching user goal:", error);
      }
    };
    fetchUserGoal();
  }, []);

  const getRecommendedExercises = () => {
    const exercises = Object.entries(commonExercises).map(([id, exercise]) => ({
      ...exercise,
      id,
    }));

    switch (userGoal) {
      case "weight":
        return exercises.filter(
          (exercise) =>
            exercise.targetMuscles.includes("cardio") ||
            exercise.difficulty === "beginner" ||
            exercise.targetMuscles.includes("full_body")
        );
      case "strength":
        return exercises.filter(
          (exercise) =>
            (exercise.sets && exercise.reps) ||
            exercise.targetMuscles.some((muscle) =>
              [
                "chest",
                "shoulders",
                "triceps",
                "quadriceps",
                "hamstrings",
                "glutes",
              ].includes(muscle)
            )
        );
      case "stamina":
        return exercises.filter(
          (exercise) =>
            exercise.targetMuscles.includes("cardio") ||
            exercise.targetMuscles.includes("full_body") ||
            exercise.duration >= 30
        );
      default:
        return exercises;
    }
  };

  const handleExerciseToggle = (exerciseId: string) => {
    setSelectedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      }
      return [...prev, exerciseId];
    });
  };

  const handleNext = async () => {
    if (selectedExercises.length < 3) {
      setError("Please select at least 3 exercises");
      return;
    }

    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("No user found");

      // Update the user's profile with selected exercises
      await updateUserProfile({
        ...currentUser.profile,
        selectedExercises,
        onboardingCompleted: true,
      });

      router.replace("/(tabs)");
    } catch (err) {
      setError("Failed to save exercises. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recommendedExercises = getRecommendedExercises();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backButtonText}>Goals</Text>
        </TouchableOpacity>
        <View style={styles.progressIndicator}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Customize Your Workout</Text>
        <Text style={styles.subtitle}>
          Select exercises that match your fitness level and preferences.
          {"\n"}Choose at least 3 exercises to continue.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.exercisesGrid}>
          {recommendedExercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                selectedExercises.includes(exercise.id) && styles.selectedCard,
              ]}
              onPress={() => handleExerciseToggle(exercise.id)}
            >
              <Image
                source={getExerciseImage(exercise.id)}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetail}>
                  {exercise.duration}s • {exercise.difficulty}
                </Text>
                <View style={styles.targetMuscles}>
                  {exercise.targetMuscles.map((muscle, index) => (
                    <Text key={index} style={styles.muscle}>
                      {muscle}
                    </Text>
                  ))}
                </View>
                {exercise.tips.length > 0 && (
                  <Text style={styles.tips}>Tip: {exercise.tips[0]}</Text>
                )}
              </View>
              {selectedExercises.includes(exercise.id) && (
                <View style={styles.checkmark}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={COLORS.success}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (selectedExercises.length < 3 || loading) && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedExercises.length < 3 || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Saving..." : "Complete Setup"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 4,
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
  exercisesGrid: {
    gap: 16,
  },
  exerciseCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  targetMuscles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  muscle: {
    fontSize: 12,
    color: COLORS.card,
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tips: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: COLORS.error,
    marginBottom: 20,
    textAlign: "center",
  },
});
