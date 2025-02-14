import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
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
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [bgMusic, setBgMusic] = useState<Audio.Sound | null>(null);
  const [bgMusicVolume, setBgMusicVolume] = useState(0);

  const currentExercise = workout?.exercises[currentExerciseIndex];

  useEffect(() => {
    if (!workout) return;
    setTimeLeft(currentExercise?.duration || 0);
  }, [currentExerciseIndex, workout]);

  // Load and play countdown sound
  const playCountdownSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../../../assets/audio/short-beep-countdown.mp3")
        );
        setSound(newSound);
        await newSound.playAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Load background music
  const loadBackgroundMusic = async () => {
    try {
      const { sound: music } = await Audio.Sound.createAsync(
        require("../../../assets/audio/workout-music.mp3"),
        {
          isLooping: true,
          volume: 0,
          shouldPlay: false,
        }
      );
      setBgMusic(music);
    } catch (error) {
      console.error("Error loading background music:", error);
    }
  };

  // Fade in effect
  const fadeInMusic = async () => {
    if (!bgMusic) return;

    // Start playing at volume 0
    await bgMusic.playAsync();

    // Gradually increase volume
    for (let vol = 0; vol <= 1; vol += 0.1) {
      await bgMusic.setVolumeAsync(vol);
      setBgMusicVolume(vol);
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay between volume changes
    }
  };

  // Fade out effect
  const fadeOutMusic = async () => {
    if (!bgMusic) return;

    // Gradually decrease volume
    for (let vol = bgMusicVolume; vol >= 0; vol -= 0.1) {
      await bgMusic.setVolumeAsync(vol);
      setBgMusicVolume(vol);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await bgMusic.stopAsync();
  };

  // Load background music when component mounts
  useEffect(() => {
    loadBackgroundMusic();
    return () => {
      if (bgMusic) {
        bgMusic.unloadAsync();
      }
    };
  }, []);

  // Modified countdown effect to start music
  useEffect(() => {
    if (showCountdown) {
      if (countdownValue > 0) {
        // Animate scale up and down
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]).start();

        // Decrease countdown after 1 second
        const timer = setTimeout(() => {
          setCountdownValue((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        // Start workout and fade in music
        setShowCountdown(false);
        setIsPaused(false);
        fadeInMusic();
      }
    }
  }, [showCountdown, countdownValue]);

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
          setTimeLeft(workout!.exercises[currentExerciseIndex + 1].duration);
        } else {
          handleWorkoutComplete();
        }
      } else {
        if (currentExerciseIndex < workout!.exercises.length - 1) {
          setIsResting(true);
          setTimeLeft(workout!.restBetweenExercises);
        } else {
          handleWorkoutComplete();
        }
      }
    }

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, isResting, currentExerciseIndex]);

  const handleWorkoutComplete = async () => {
    await fadeOutMusic();
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

  const handlePauseResume = async () => {
    if (isPaused) {
      setShowCountdown(true);
      setCountdownValue(3);
      playCountdownSound();
    } else {
      setIsPaused(true);
      if (bgMusic) {
        await bgMusic.pauseAsync();
      }
    }
  };

  // Add resume music function
  const resumeMusic = async () => {
    if (!bgMusic || !isPaused) return;
    await bgMusic.playAsync();
    // Restore previous volume
    if (bgMusicVolume > 0) {
      await bgMusic.setVolumeAsync(bgMusicVolume);
    }
  };

  // Modify the Alert handlers to resume music
  const handleQuit = () => {
    setIsPaused(true);
    if (bgMusic) {
      bgMusic.pauseAsync();
    }
    Alert.alert(
      "Quit Workout",
      "Are you sure you want to quit this workout?",
      [
        {
          text: "Resume",
          onPress: async () => {
            setIsPaused(false);
            await resumeMusic();
          },
          style: "default",
        },
        {
          text: "Cancel",
          onPress: async () => {
            setIsPaused(false);
            await resumeMusic();
          },
          style: "cancel",
        },
        {
          text: "Quit",
          style: "destructive",
          onPress: async () => {
            await fadeOutMusic();
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
        <Text>No workout available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showCountdown ? (
        <View style={styles.countdownOverlay}>
          <Animated.Text
            style={[
              styles.countdownText,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            {countdownValue}
          </Animated.Text>
        </View>
      ) : (
        <>
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
            {isResting ? (
              <View style={styles.nextExerciseContainer}>
                <Text style={styles.nextExerciseTitle}>Next Exercise:</Text>
                <Text style={styles.nextExerciseName}>
                  {workout.exercises[currentExerciseIndex + 1].name}
                </Text>
                <Text style={styles.nextExerciseDescription}>
                  {workout.exercises[currentExerciseIndex + 1].description}
                </Text>
              </View>
            ) : (
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
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
              <Text style={styles.quitButtonText}>Quit Workout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: COLORS.background,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  phaseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
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
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  nextExerciseContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  nextExerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  nextExerciseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  nextExerciseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
