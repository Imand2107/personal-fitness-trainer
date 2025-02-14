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
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import { workoutPlans } from "../../../../assets/data/workouts";
import {
  completeWorkout,
  updateExerciseProgress,
} from "../../../../src/services/workout";
import { auth } from "../../../../firebase/config";

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

// Add type for playback status
type PlaybackStatus = {
  isLoaded: boolean;
  volume?: number;
};

// Add getExerciseImage function
const getExerciseImage = (imageUrl: string) => {
  try {
    // Extract the filename from the path
    const filename = imageUrl.split("/").pop()?.toLowerCase();

    // Map of all available exercise images
    const imageMap: { [key: string]: any } = {
      "jumping-jacks.gif": require("../../../../assets/images/exercises/jumping-jacks.gif"),
      "high-knees.gif": require("../../../../assets/images/exercises/high-knees.gif"),
      "mountain-climbers.gif": require("../../../../assets/images/exercises/mountain-climbers.gif"),
      "pushup.gif": require("../../../../assets/images/exercises/pushup.gif"),
      "wide-arm-push-up.gif": require("../../../../assets/images/exercises/wide-arm-push-up.gif"),
      "diamond_push-up.gif": require("../../../../assets/images/exercises/Diamond_Push-Up.gif"),
      "plank.jpg": require("../../../../assets/images/exercises/plank.jpg"),
      "russian-twist.gif": require("../../../../assets/images/exercises/russian-twist.gif"),
      "leg-raises.gif": require("../../../../assets/images/exercises/leg-raises.gif"),
      "squats.gif": require("../../../../assets/images/exercises/squats.gif"),
      "lunges.gif": require("../../../../assets/images/exercises/lunges.gif"),
      "burpee.webp": require("../../../../assets/images/exercises/burpee.webp"),
    };

    if (filename && filename in imageMap) {
      return imageMap[filename];
    }

    // Return default plank image if the specific image is not found
    console.warn(`Image not found: ${filename}, using fallback`);
    return require("../../../../assets/images/exercises/plank.jpg");
  } catch (error) {
    console.error("Error loading exercise image:", error);
    return require("../../../../assets/images/exercises/plank.jpg");
  }
};

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const workout = workoutPlans.find((w) => w.id === id);

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
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<any>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setTimeLeft(workout!.exercises[currentExerciseIndex + 1].duration);
        } else {
          handleWorkoutComplete();
        }
      } else {
        // Exercise is complete, update progress
        const userId = auth.currentUser?.uid;
        if (userId && workout?.id) {
          updateExerciseProgress(
            workout.id,
            currentExerciseIndex,
            totalTimeElapsed,
            true
          ).catch(console.error);
        }

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
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !workout?.id) return;

      // Prepare exercise data
      const exerciseData = workout.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
      }));

      await completeWorkout(
        workout.id,
        totalTimeElapsed,
        workout.calories,
        exerciseData
      );

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

  const handleCloseCompletion = async () => {
    setShowCompletionModal(false);
    if (bgMusic) {
      await bgMusic.unloadAsync();
    }
    router.back();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load and play countdown sound
  const playCountdownSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          require("../../../../assets/audio/short-beep-countdown.mp3")
        );
        setSound(newSound);
        await newSound.playAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Load background music
  const loadBackgroundMusic = async () => {
    try {
      console.log("Loading background music...");
      const { sound: music } = await Audio.Sound.createAsync(
        require("../../../../assets/audio/background-music.mp3"),
        {
          isLooping: true,
          volume: 0,
          shouldPlay: false,
        }
      );
      console.log("Background music loaded successfully");
      setBgMusic(music);
      return music;
    } catch (error) {
      console.error("Error loading background music:", error);
      return null;
    }
  };

  // Load completion sound
  const loadCompletionSound = async () => {
    try {
      console.log("Loading completion sound...");
      const { sound: completionSnd } = await Audio.Sound.createAsync(
        require("../../../../assets/audio/completion.mp3"),
        { volume: 1, shouldPlay: false }
      );
      console.log("Completion sound loaded successfully");
      setCompletionSound(completionSnd);
      return completionSnd;
    } catch (error) {
      console.error("Error loading completion sound:", error);
      return null;
    }
  };

  // Play completion sound
  const playCompletionSound = async () => {
    try {
      if (completionSound) {
        const status = await completionSound.getStatusAsync();
        if (status.isLoaded) {
          await completionSound.replayAsync();
        } else {
          console.warn("Completion sound not loaded, reloading...");
          const newSound = await loadCompletionSound();
          if (newSound) {
            await newSound.playAsync();
          }
        }
      }
    } catch (error) {
      console.error("Error playing completion sound:", error);
    }
  };

  const fadeOutMusic = async () => {
    try {
      if (!bgMusic || !isAudioReady) return;

      console.log("Starting music fade out...");
      const status = (await bgMusic.getStatusAsync()) as PlaybackStatus;
      const currentVolume = status.isLoaded ? status.volume || 0.5 : 0.5;

      // Fade out more smoothly with smaller steps
      for (let volume = currentVolume; volume >= 0; volume -= 0.1) {
        if (!bgMusic) break;
        await bgMusic.setVolumeAsync(Math.max(0, volume));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await bgMusic.stopAsync();
    } catch (error) {
      console.error("Error fading out music:", error);
    }
  };

  // Initialize audio settings and load sounds
  useEffect(() => {
    let isMounted = true;

    const initializeAudio = async () => {
      try {
        console.log("Initializing audio...");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        if (isMounted) {
          const [musicSound, completeSound] = await Promise.all([
            loadBackgroundMusic(),
            loadCompletionSound(),
          ]);

          if (isMounted && musicSound && completeSound) {
            console.log("All sounds loaded successfully");
            setIsAudioReady(true);
          }
        }
      } catch (error) {
        console.error("Error initializing audio:", error);
        if (isMounted) {
          setError("Failed to initialize audio. Please restart the app.");
        }
      }
    };

    initializeAudio();

    return () => {
      isMounted = false;
      const cleanup = async () => {
        try {
          if (bgMusic) {
            await fadeOutMusic();
            await bgMusic.unloadAsync();
          }
          if (completionSound) {
            await completionSound.unloadAsync();
          }
          if (sound) {
            await sound.unloadAsync();
          }
        } catch (error) {
          console.error("Error cleaning up sounds:", error);
        }
      };
      cleanup();
    };
  }, []);

  const fadeInMusic = async () => {
    try {
      if (!bgMusic || !isAudioReady) return;

      console.log("Starting music fade in...");
      await bgMusic.setVolumeAsync(0);
      await bgMusic.playAsync();

      // Fade in more smoothly with smaller steps
      for (let volume = 0; volume <= 0.5; volume += 0.1) {
        if (!bgMusic) break;
        await bgMusic.setVolumeAsync(volume);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error fading in music:", error);
    }
  };

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

        // Play countdown sound
        playCountdownSound();

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

  const handleMuteToggle = async () => {
    if (!bgMusic) return;

    try {
      if (isMuted) {
        // Unmute - restore previous volume
        await bgMusic.setVolumeAsync(previousVolume);
        setBgMusicVolume(previousVolume);
      } else {
        // Mute - save current volume and set to 0
        setPreviousVolume(bgMusicVolume);
        await bgMusic.setVolumeAsync(0);
        setBgMusicVolume(0);
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  const handleQuit = async () => {
    setIsPaused(true);
    if (bgMusic) {
      await bgMusic.pauseAsync();
    }

    // Use confirm for web compatibility
    if (typeof window !== "undefined") {
      const confirmQuit = window.confirm(
        "Are you sure you want to quit this workout?"
      );
      if (confirmQuit) {
        await fadeOutMusic();
        if (bgMusic) {
          await bgMusic.unloadAsync();
        }
        router.replace("/(tabs)/workout");
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
              if (bgMusic) {
                await bgMusic.unloadAsync();
              }
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
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Container */}
      <View style={styles.backgroundContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.muteButton}
            onPress={handleMuteToggle}
          >
            <Ionicons
              name={isMuted ? "volume-mute" : "volume-medium"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

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
                      workout!.exercises.length
                    }`}
              </Text>
            </View>

            {/* Current Exercise Section */}
            <View style={styles.exerciseSection}>
              {isResting ? (
                <View style={styles.restingSection}>
                  <View style={styles.nextExercisePreview}>
                    <Text style={styles.nextExerciseTitle}>
                      Coming Up Next:
                    </Text>
                    <Text style={styles.nextExerciseName}>
                      {nextExercise?.name}
                    </Text>
                    <Text style={styles.nextExerciseDescription}>
                      {nextExercise?.description}
                    </Text>
                    <View style={styles.nextExerciseDetails}>
                      {nextExercise?.sets && (
                        <Text style={styles.nextExerciseDetail}>
                          {nextExercise.sets} sets × {nextExercise.reps} reps
                        </Text>
                      )}
                      <Text style={styles.nextExerciseDetail}>
                        Duration: {nextExercise?.duration}s
                      </Text>
                      <Text style={styles.nextExerciseDetail}>
                        Target: {nextExercise?.targetMuscles.join(", ")}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <Image
                    source={getExerciseImage(currentExercise!.imageUrl)}
                    style={styles.exerciseImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.exerciseName}>
                    {currentExercise?.name}
                  </Text>
                  <Text style={styles.exerciseDescription}>
                    {currentExercise?.description}
                  </Text>
                  {currentExercise?.sets && currentExercise?.reps && (
                    <Text style={styles.exerciseDetail}>
                      {currentExercise.sets} sets × {currentExercise.reps} reps
                    </Text>
                  )}
                  {currentExercise?.duration && (
                    <Text style={styles.exerciseDetail}>
                      Duration: {currentExercise.duration} seconds
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Controls Section */}
            <View style={styles.controlsSection}>
              {isResting ? (
                <View style={styles.restControls}>
                  <TouchableOpacity
                    style={styles.restButton}
                    onPress={() => setTimeLeft(0)}
                  >
                    <View style={styles.restButtonContent}>
                      <Ionicons
                        name="play-skip-forward"
                        size={24}
                        color={COLORS.primary}
                      />
                      <Text style={styles.restButtonText}>Skip</Text>
                    </View>
                  </TouchableOpacity>

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

                  <TouchableOpacity
                    style={styles.restButton}
                    onPress={() => setTimeLeft((prev) => prev + 15)}
                  >
                    <View style={styles.restButtonContent}>
                      <Ionicons
                        name="add-circle"
                        size={24}
                        color={COLORS.primary}
                      />
                      <Text style={styles.restButtonText}>+15s</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
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
              )}
              <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
                <Text style={styles.quitButtonText}>Quit Workout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal
          visible={showCompletionModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <Animated.View
              style={[styles.completionCard, { opacity: fadeAnim }]}
            >
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
                Exercises: {workout?.exercises.length}
                {"\n"}
                Estimated Calories: {workout?.calories}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
    height: 200,
    marginBottom: 15,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
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
  controlsSection: {
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  controlButton: {
    marginBottom: 8,
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
    zIndex: 5,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  nextExerciseTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  nextExerciseName: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
  },
  nextExerciseDescription: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 26,
  },
  nextExerciseDetails: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  nextExerciseDetail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
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
  restingSection: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  nextExercisePreview: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  restControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  restButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  restButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  restButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  muteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
