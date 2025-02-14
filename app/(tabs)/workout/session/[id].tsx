import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { workoutPlans } from "../../../../assets/data/workouts";
import { completeWorkout } from "../../../../src/services/workout";
import { auth } from "../../../../firebase/config";

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const workout = workoutPlans.find((w) => w.id === id);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const nextExercise = workout?.exercises[currentExerciseIndex + 1];

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
        // Rest period is over, move to next exercise
        setIsResting(false);
        if (currentExerciseIndex < workout!.exercises.length - 1) {
          setCurrentExerciseIndex((prev) => prev + 1);
        } else {
          handleWorkoutComplete();
        }
      } else if (currentExerciseIndex < workout!.exercises.length - 1) {
        // Exercise is complete, start rest period
        setIsResting(true);
        setTimeLeft(workout!.restBetweenExercises);
      } else {
        // Workout is complete
        handleWorkoutComplete();
      }
    }

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, isResting, currentExerciseIndex]);

  const getMotivationalMessage = () => {
    const messages = [
      "You crushed it! 💪",
      "What a fantastic workout! 🌟",
      "You're getting stronger every day! 💪",
      "Amazing effort! Keep pushing! 🔥",
      "You're on fire! Great work! 🎯",
      "One step closer to your goals! 🎉",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleWorkoutComplete = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !workout?.id) return;

      await completeWorkout(workout.id);

      // Show completion modal with animation
      setShowCompletionModal(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Trigger confetti after a short delay
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  };

  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
    router.back();
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
    setIsPaused(true);
    Alert.alert(
      "Quit Workout",
      "Are you sure you want to quit this workout?",
      [
        {
          text: "Resume",
          onPress: () => {
            setIsPaused(false);
          },
          style: "default",
        },
        {
          text: "Cancel",
          onPress: () => {
            setIsPaused(false);
          },
          style: "cancel",
        },
        {
          text: "Quit",
          style: "destructive",
          onPress: () => {
            router.replace("/(tabs)/workout");
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!workout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text>Workout not found</Text>
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

        {/* Next Up Section - Only show during rest periods */}
        {isResting && nextExercise && (
          <View style={styles.nextUpContainer}>
            <Text style={styles.nextUpTitle}>Next Up</Text>
            <View style={styles.nextExerciseCard}>
              <Image
                source={
                  nextExercise.imageUrl
                    ? { uri: nextExercise.imageUrl }
                    : require("../../../../assets/images/exercises/plank.jpg")
                }
                style={styles.nextExerciseImage}
                resizeMode="cover"
              />
              <View style={styles.nextExerciseInfo}>
                <Text style={styles.nextExerciseName}>{nextExercise.name}</Text>
                <Text style={styles.nextExerciseDetail}>
                  {nextExercise.duration}s
                  {nextExercise.sets && nextExercise.reps
                    ? ` • ${nextExercise.sets} sets × ${nextExercise.reps} reps`
                    : ""}
                </Text>
                <Text style={styles.nextExerciseDescription} numberOfLines={2}>
                  {nextExercise.description}
                </Text>
              </View>
            </View>
          </View>
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

      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.completionCard, { opacity: fadeAnim }]}>
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{ x: -10, y: 0 }}
              autoStart={false}
              fadeOut={true}
            />

            <Ionicons name="trophy" size={80} color="#FFD700" />
            <Text style={styles.completionTitle}>Workout Complete!</Text>
            <Text style={styles.motivationalMessage}>
              {getMotivationalMessage()}
            </Text>
            <Text style={styles.completionStats}>
              Time: {Math.floor(totalTimeElapsed / 60)} minutes{"\n"}
              Exercises: {workout.exercises.length}
              {"\n"}
              Estimated Calories: {workout.calories}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseCompletion}
            >
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    marginBottom: 24,
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
  nextUpContainer: {
    marginTop: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  nextUpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  nextExerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nextExerciseImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  nextExerciseInfo: {
    flex: 1,
  },
  nextExerciseName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  nextExerciseDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nextExerciseDescription: {
    fontSize: 14,
    color: "#666",
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  completionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 18,
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 16,
  },
  completionStats: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
