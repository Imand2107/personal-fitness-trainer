import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { workoutPlans } from "../../../assets/data/workouts";

export default function QuickStartScreen() {
  const router = useRouter();
  // Select a random beginner-friendly workout
  const workout =
    workoutPlans.find((w) => w.difficulty === "beginner") || workoutPlans[0];

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  const currentExercise = workout?.exercises[currentExerciseIndex];

  useEffect(() => {
    if (!workout) return;
    setTimeLeft(currentExercise?.duration || 0);
  }, [currentExerciseIndex, workout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTotalTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && !isPaused) {
      if (isResting) {
        setIsResting(false);
        if (currentExerciseIndex < workout!.exercises.length - 1) {
          setCurrentExerciseIndex((prev) => prev + 1);
        } else {
          handleWorkoutComplete();
        }
      } else if (currentExerciseIndex < workout!.exercises.length - 1) {
        setIsResting(true);
        setTimeLeft(workout!.restBetweenExercises);
      } else {
        handleWorkoutComplete();
      }
    }

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, isResting, currentExerciseIndex]);

  const handleWorkoutComplete = () => {
    Alert.alert(
      "Workout Complete!",
      `Great job! You completed the quick workout in ${Math.floor(
        totalTimeElapsed / 60
      )} minutes.`,
      [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/workout"),
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleQuit = () => {
    console.log("Quit button pressed");
    setIsPaused(true); // Pause the workout when showing confirmation
    console.log("Showing alert dialog");
    Alert.alert(
      "Quit Workout",
      "Are you sure you want to quit this workout?",
      [
        {
          text: "Resume",
          onPress: () => {
            console.log("Resume pressed");
            setIsPaused(false); // Resume the workout if user chooses to continue
          },
          style: "default",
        },
        {
          text: "Cancel",
          onPress: () => {
            console.log("Cancel pressed");
            setIsPaused(false); // Resume the workout if user cancels
          },
          style: "cancel",
        },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            console.log("Quit confirmed");
            router.replace("/(tabs)/workout"); // Navigate back to workout screen
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!workout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text>No workout available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer Section */}
      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.phaseText}>
          {isResting
            ? "Rest"
            : `Exercise ${currentExerciseIndex + 1}/${
                workout.exercises.length
              }`}
        </Text>
      </View>

      {/* Current Exercise Section */}
      <ScrollView style={styles.exerciseSection}>
        <Text style={styles.exerciseName}>
          {isResting ? "Rest Period" : currentExercise.name}
        </Text>
        {!isResting && (
          <>
            <Text style={styles.exerciseDescription}>
              {currentExercise.description}
            </Text>
            {currentExercise.sets && currentExercise.reps && (
              <Text style={styles.exerciseDetail}>
                {currentExercise.sets} sets × {currentExercise.reps} reps
              </Text>
            )}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips:</Text>
              {currentExercise.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePauseResume}
        >
          <Ionicons
            name={isPaused ? "play-circle" : "pause-circle"}
            size={64}
            color="#007AFF"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f8f9fa",
  },
  timerText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#007AFF",
  },
  phaseText: {
    fontSize: 18,
    color: "#666",
    marginTop: 8,
  },
  exerciseSection: {
    flex: 1,
    padding: 20,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  exerciseDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    lineHeight: 24,
  },
  exerciseDetail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  controlsSection: {
    padding: 20,
    alignItems: "center",
  },
  controlButton: {
    marginBottom: 16,
  },
  quitButton: {
    padding: 12,
  },
  quitButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});
