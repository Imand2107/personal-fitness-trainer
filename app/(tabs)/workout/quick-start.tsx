import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { workoutPlans } from "../../../assets/data/workouts";
import ConfettiCannon from "react-native-confetti-cannon";
import { completeWorkout } from "../../../src/services/workout";
import { auth } from "../../../firebase/config";

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

// Modify the getExerciseImage function
const getExerciseImage = (imageUrl: string) => {
  try {
    // Extract the filename from the path
    const filename = imageUrl.split("/").pop()?.toLowerCase();

    // Map of all available exercise images
    const imageMap: { [key: string]: any } = {
      "jumping-jacks.gif": require("../../../assets/images/exercises/jumping-jacks.gif"),
      "high-knees.gif": require("../../../assets/images/exercises/high-knees.gif"),
      "mountain-climbers.gif": require("../../../assets/images/exercises/mountain-climbers.gif"),
      "pushup.gif": require("../../../assets/images/exercises/pushup.gif"),
      "wide-arm-push-up.gif": require("../../../assets/images/exercises/wide-arm-push-up.gif"),
      "diamond_push-up.gif": require("../../../assets/images/exercises/Diamond_Push-Up.gif"),
      "plank.jpg": require("../../../assets/images/exercises/plank.jpg"),
      "russian-twist.gif": require("../../../assets/images/exercises/russian-twist.gif"),
      "leg-raises.gif": require("../../../assets/images/exercises/leg-raises.gif"),
      "squats.gif": require("../../../assets/images/exercises/squats.gif"),
      "lunges.gif": require("../../../assets/images/exercises/lunges.gif"),
      "burpee.webp": require("../../../assets/images/exercises/burpee.webp"),
    };

    if (filename && filename in imageMap) {
      return imageMap[filename];
    }

    // Return default plank image if the specific image is not found
    console.warn(`Image not found: ${filename}, using fallback`);
    return require("../../../assets/images/exercises/plank.jpg");
  } catch (error) {
    console.error("Error loading exercise image:", error);
    return require("../../../assets/images/exercises/plank.jpg");
  }
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
  const [completionSound, setCompletionSound] = useState<Audio.Sound | null>(
    null
  );
  const [bgMusicVolume, setBgMusicVolume] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);
  const [showTips, setShowTips] = useState(false);

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

  // Load completion sound
  const loadCompletionSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/audio/workout-complete-male.mp3")
      );
      setCompletionSound(sound);
    } catch (error) {
      console.error("Error loading completion sound:", error);
    }
  };

  // Play completion sound
  const playCompletionSound = async () => {
    try {
      if (completionSound) {
        await completionSound.replayAsync();
      }
    } catch (error) {
      console.error("Error playing completion sound:", error);
    }
  };

  // Load sounds when component mounts
  useEffect(() => {
    loadBackgroundMusic();
    loadCompletionSound();
    return () => {
      if (bgMusic) {
        bgMusic.unloadAsync();
      }
      if (completionSound) {
        completionSound.unloadAsync();
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
    await fadeOutMusic();

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

      // Play completion sound and trigger confetti
      await playCompletionSound();
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  };

  const handleCloseCompletion = () => {
    setShowCompletionModal(false);
    router.replace("/(tabs)/workout");
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

    // Use confirm for web compatibility
    if (typeof window !== "undefined") {
      const confirmQuit = window.confirm(
        "Are you sure you want to quit this workout?"
      );
      if (confirmQuit) {
        fadeOutMusic().then(() => {
          router.replace("/(tabs)/workout");
        });
      } else {
        setIsPaused(false);
        resumeMusic();
      }
    } else {
      // Fallback to Alert for native
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
    }
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
          <View style={styles.exerciseSection}>
            {/* Exercise Image */}
            {isResting ? (
              <>
                <Image
                  source={getExerciseImage(
                    workout.exercises[currentExerciseIndex + 1].imageUrl
                  )}
                  style={styles.exerciseImage}
                  resizeMode="contain"
                />
                <View style={styles.restControls}>
                  <TouchableOpacity
                    style={styles.addTimeButton}
                    onPress={() => setTimeLeft((prev) => prev + 15)}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                    <Text style={styles.addTimeText}>+15s</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.nextExerciseTitle}>Next Exercise:</Text>
                <Text style={styles.nextExerciseName}>
                  {workout.exercises[currentExerciseIndex + 1].name}
                </Text>
                <Text style={styles.nextExerciseDescription}>
                  {workout.exercises[currentExerciseIndex + 1].description}
                </Text>
              </>
            ) : (
              <>
                <Image
                  source={getExerciseImage(currentExercise.imageUrl)}
                  style={styles.exerciseImage}
                  resizeMode="contain"
                />
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>
                    {currentExercise.name}
                  </Text>
                  {currentExercise.tips && currentExercise.tips.length > 0 && (
                    <TouchableOpacity
                      style={styles.tipsButton}
                      onPress={() => setShowTips(!showTips)}
                    >
                      <Ionicons
                        name={
                          showTips
                            ? "information-circle"
                            : "information-circle-outline"
                        }
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {showTips && (
                  <View style={styles.tipsPopupOverlay}>
                    <View style={styles.tipsPopup}>
                      <View style={styles.tipsHeader}>
                        <Text style={styles.tipsTitle}>Tips:</Text>
                        <TouchableOpacity
                          onPress={() => setShowTips(false)}
                          style={styles.closeTipsButton}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={COLORS.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                      {currentExercise.tips.map((tip, index) => (
                        <Text key={index} style={styles.tipText}>
                          • {tip}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                <Text style={styles.exerciseDescription}>
                  {currentExercise.description}
                </Text>
                {currentExercise.sets && currentExercise.reps && (
                  <Text style={styles.exerciseDetail}>
                    {currentExercise.sets} sets × {currentExercise.reps} reps
                  </Text>
                )}
                {currentExercise.duration && (
                  <Text style={styles.exerciseDetail}>
                    Duration: {currentExercise.duration} seconds
                  </Text>
                )}
              </>
            )}
          </View>

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

            {/* Debug button - Remove before production */}
            {/* {__DEV__ && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={handleWorkoutComplete}
              >
                <Text style={styles.debugButtonText}>🐛 Test Completion</Text>
              </TouchableOpacity>
            )} */}
          </View>
        </>
      )}

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

            <Ionicons name="trophy" size={80} color={COLORS.secondary} />
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  exerciseImage: {
    width: "100%",
    height: 200, // Reduced height
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    color: COLORS.text,
  },
  exerciseDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    color: COLORS.textSecondary,
  },
  exerciseDetail: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.primary,
    marginBottom: 8,
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
  nextExerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: COLORS.text,
  },
  nextExerciseName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: COLORS.primary,
  },
  nextExerciseDescription: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  completionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "85%",
    shadowColor: COLORS.primary,
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
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  motivationalMessage: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  completionStats: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: "600",
  },
  debugButton: {
    marginTop: 10,
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  debugButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
    width: "100%",
  },
  tipsButton: {
    position: "absolute",
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  tipsPopupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  tipsPopup: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: "95%",
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tipsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  closeTipsButton: {
    padding: 4,
  },
  restControls: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addTimeText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "600",
  },
});
