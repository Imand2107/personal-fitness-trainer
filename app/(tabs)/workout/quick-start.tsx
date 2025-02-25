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
import {
  completeWorkout,
  updateExerciseProgress,
} from "../../../src/services/workout";
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
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [tooltipProgress, setTooltipProgress] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log("[Sound] Loading background music...");
      const { sound: music } = await Audio.Sound.createAsync(
        require("../../../assets/audio/workout-music.mp3"),
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0.5,
        },
        (status) => {
          if (status.isLoaded) {
            console.log("[Sound] Background music loaded successfully");
            setBgMusicVolume(0.5);
          } else if (status.error) {
            console.error(
              "[Sound] Error loading background music:",
              status.error
            );
          }
        }
      );
      setBgMusic(music);
      setIsAudioReady(true);
      console.log("[Sound] Background music initialized");
    } catch (error) {
      console.error("[Sound] Error loading background music:", error);
      setError("Failed to load background music");
    }
  };

  // Modified countdown effect to start music
  useEffect(() => {
    if (showCountdown) {
      if (countdownValue === 3) {
        playCountdownSound();
      }
      
      if (countdownValue > 0) {
        // Animate scale with safe numeric values
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();

        const timer = setTimeout(() => {
          setCountdownValue((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        setShowCountdown(false);
        setIsPaused(false);
        if (bgMusic) {
          bgMusic.playAsync();
        }
      }
    }
  }, [showCountdown, countdownValue]);

  // Initialize audio when component mounts
  useEffect(() => {
    let mounted = true;

    const initializeAudio = async () => {
      try {
        console.log("[Sound] Initializing audio...");
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        if (mounted) {
          await loadBackgroundMusic();
          await loadCompletionSound();
        }
      } catch (error) {
        console.error("[Sound] Error initializing audio:", error);
      }
    };

    initializeAudio();

    return () => {
      mounted = false;
      // Cleanup sounds
      const cleanup = async () => {
        if (bgMusic) {
          await fadeOutMusic();
          await bgMusic.unloadAsync();
        }
        if (sound) {
          await sound.unloadAsync();
        }
        if (completionSound) {
          await completionSound.unloadAsync();
        }
      };
      cleanup();
    };
  }, []);

  // Modify fadeInMusic function for safer volume handling
  const fadeInMusic = async () => {
    if (!bgMusic) {
      console.log("[Sound] No background music available");
      return;
    }

    try {
      console.log("[Sound] Starting fade in...");
      const status = await bgMusic.getStatusAsync();
      if (!status.isLoaded) {
        console.log("[Sound] Sound not loaded, reloading...");
        await loadBackgroundMusic();
      }

      // Start playing at volume 0
      await bgMusic.setVolumeAsync(0);
      await bgMusic.playAsync();

      // Use safer volume values
      const targetVolume = isMuted ? 0 : 0.5;
      const steps = 5;
      const interval = 100; // milliseconds
      const volumeIncrement = Number((targetVolume / steps).toFixed(2));

      for (let i = 0; i <= steps; i++) {
        if (!bgMusic) break;
        const newVolume = Number(
          Math.min(volumeIncrement * i, targetVolume).toFixed(2)
        );
        await bgMusic.setVolumeAsync(newVolume);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
      setBgMusicVolume(targetVolume);
      console.log("[Sound] Fade in complete");
    } catch (error) {
      console.error("[Sound] Error during fade in:", error);
    }
  };

  // Modify fadeOutMusic function for safer volume handling
  const fadeOutMusic = async () => {
    if (!bgMusic) {
      console.log("[Sound] No background music to fade out");
      return;
    }

    try {
      console.log("[Sound] Starting fade out...");
      const status = await bgMusic.getStatusAsync();
      if (!status.isLoaded) {
        console.log("[Sound] Sound not loaded, skipping fade out");
        return;
      }

      if (status.isPlaying) {
        const steps = 5;
        const interval = 100;
        const volumeDecrement = Number((bgMusicVolume / steps).toFixed(2));

        for (let i = steps; i >= 0; i--) {
          const newVolume = Number((volumeDecrement * i).toFixed(2));
          await bgMusic.setVolumeAsync(Math.max(0, newVolume));
          setBgMusicVolume(newVolume);
          await new Promise((resolve) => setTimeout(resolve, interval));
        }

        await bgMusic.stopAsync();
      }
      console.log("[Sound] Fade out complete");
    } catch (error) {
      console.error("[Sound] Error during fade out:", error);
    }
  };

  // Load completion sound
  const loadCompletionSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/audio/workout-complete.mp3")
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

  // Add auto-close timer for tips
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTips) {
      setTooltipProgress(0);
      interval = setInterval(() => {
        setTooltipProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setShowTips(false);
            return 0;
          }
          return prev + 100 / 70; // 7 seconds = 70 intervals of 100ms
        });
      }, 100);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showTips]);

  // Add mute/unmute function
  const handleMuteToggle = async () => {
    if (!bgMusic) return;

    try {
      if (isMuted) {
        // Unmute - restore previous volume
        await bgMusic.setVolumeAsync(previousVolume);
        setBgMusicVolume(previousVolume);
        setIsMuted(false);
      } else {
        // Mute - save current volume and set to 0
        setPreviousVolume(bgMusicVolume);
        await bgMusic.setVolumeAsync(0);
        setBgMusicVolume(0);
        setIsMuted(true);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

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

      // Play completion sound and trigger confetti
      await playCompletionSound();
      setTimeout(() => {
        confettiRef.current?.start();
      }, 300);
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  };

  // Modify handleQuit function
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

  // Modify handleCloseCompletion function
  const handleCloseCompletion = async () => {
    setShowCompletionModal(false);
    if (bgMusic) {
      await bgMusic.unloadAsync();
    }
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

  if (!workout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text>No workout available</Text>
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
                      workout.exercises.length
                    }`}
              </Text>
            </View>

            {/* Current Exercise Section */}
            <View style={styles.exerciseSection}>
              {/* Exercise Image */}
              {isResting ? (
                <View style={styles.restingSection}>
                  <View style={styles.nextExercisePreview}>
                    <Text style={styles.nextExerciseTitle}>
                      Coming Up Next:
                    </Text>
                    <Text style={styles.nextExerciseName}>
                      {workout.exercises[currentExerciseIndex + 1].name}
                    </Text>
                    <Text style={styles.nextExerciseDescription}>
                      {workout.exercises[currentExerciseIndex + 1].description}
                    </Text>
                    <View style={styles.nextExerciseDetails}>
                      {workout.exercises[currentExerciseIndex + 1].sets && (
                        <Text style={styles.nextExerciseDetail}>
                          {workout.exercises[currentExerciseIndex + 1].sets}{" "}
                          sets ×{" "}
                          {workout.exercises[currentExerciseIndex + 1].reps}{" "}
                          reps
                        </Text>
                      )}
                      <Text style={styles.nextExerciseDetail}>
                        Duration:{" "}
                        {workout.exercises[currentExerciseIndex + 1].duration}s
                      </Text>
                      <Text style={styles.nextExerciseDetail}>
                        Target:{" "}
                        {workout.exercises[
                          currentExerciseIndex + 1
                        ].targetMuscles.join(", ")}
                      </Text>
                    </View>
                  </View>
                </View>
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
                    {currentExercise.tips &&
                      currentExercise.tips.length > 0 && (
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
                          <Text style={styles.tipsHeaderTitle}>
                            Exercise Tips
                          </Text>
                          <TouchableOpacity
                            style={styles.closeTipsButton}
                            onPress={() => setShowTips(false)}
                          >
                            <Ionicons name="close" size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.tipsContent}>
                          {currentExercise.tips.map((tip, index) => (
                            <View key={index} style={styles.tipContainer}>
                              <Text style={styles.tipNumber}>{index + 1}</Text>
                              <Text style={styles.tipText}>{tip}</Text>
                            </View>
                          ))}
                        </ScrollView>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${tooltipProgress}%` },
                            ]}
                          />
                        </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  tipsPopup: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1E23",
    padding: 24,
    paddingTop: 60,
  },
  tipsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255, 107, 107, 0.3)",
  },
  tipsHeaderTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  closeTipsButton: {
    padding: 12,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 30,
  },
  tipsContent: {
    flex: 1,
    paddingBottom: 20,
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tipNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 16,
    backgroundColor: "rgba(255, 107, 107, 0.15)",
    width: 40,
    height: 40,
    textAlign: "center",
    lineHeight: 40,
    borderRadius: 20,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 24,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
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
  controlsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 20,
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
