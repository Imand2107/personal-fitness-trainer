import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { updateUserProfile, getCurrentUser } from "../../src/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/Colors";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "firebase/firestore";

export default function BMISetupScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const calculateBMI = (weightKg: number, heightCm: number): number => {
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return COLORS.error;
    if (bmi < 25) return COLORS.success;
    if (bmi < 30) return COLORS.secondary;
    return COLORS.error;
  };

  const handleNext = async () => {
    if (!height || !weight) {
      setError("Please fill in all fields");
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (heightNum < 100 || heightNum > 250) {
      setError("Height must be between 100 and 250 cm");
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError("Weight must be between 30 and 300 kg");
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      setError("You must be at least 13 years old to use this app");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("No user found");
      }

      const bmi = calculateBMI(weightNum, heightNum);
      const currentAge = calculateAge(dateOfBirth);

      await updateUserProfile({
        ...currentUser.profile,
        height: heightNum,
        weight: weightNum,
        bmi,
        age: currentAge,
        gender,
        dateOfBirth: Timestamp.fromDate(dateOfBirth),
      });

      router.push("/(onboarding)/goal-settings");
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const bmi =
    height && weight ? calculateBMI(Number(weight), Number(height)) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmiColor = bmi ? getBMIColor(bmi) : "#000";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="body-outline" size={60} color={COLORS.primary} />
          <Text style={styles.title}>Let's Get Started</Text>
          <Text style={styles.subtitle}>
            We'll use this information to personalize your fitness journey
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "male" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("male")}
            >
              <Ionicons
                name="male"
                size={24}
                color={gender === "male" ? COLORS.card : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === "male" && styles.genderTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === "female" && styles.genderButtonActive,
              ]}
              onPress={() => setGender("female")}
            >
              <Ionicons
                name="female"
                size={24}
                color={gender === "female" ? COLORS.card : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === "female" && styles.genderTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === "web" ? (
            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={COLORS.textSecondary}
              />
              <input
                type="date"
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontSize: 16,
                  color: COLORS.text,
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontFamily: "inherit",
                }}
                value={dateOfBirth.toISOString().split("T")[0]}
                onChange={(e) => setDateOfBirth(new Date(e.target.value))}
                max={new Date().toISOString().split("T")[0]}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDate(dateOfBirth)}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}

          <View style={styles.inputContainer}>
            <Ionicons
              name="resize-outline"
              size={24}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="scale-outline"
              size={24}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {height && weight && (
            <View style={styles.bmiContainer}>
              <Text style={styles.bmiLabel}>Your BMI</Text>
              <Text
                style={[
                  styles.bmiValue,
                  {
                    color: getBMIColor(
                      calculateBMI(parseFloat(weight), parseFloat(height))
                    ),
                  },
                ]}
              >
                {calculateBMI(parseFloat(weight), parseFloat(height)).toFixed(
                  1
                )}
              </Text>
              <Text style={styles.bmiCategory}>
                {getBMICategory(
                  calculateBMI(parseFloat(weight), parseFloat(height))
                )}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  genderTextActive: {
    color: COLORS.card,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  dateButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  bmiContainer: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bmiLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bmiCategory: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
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
