import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { auth, usersCollection } from "../../firebase/config";

export default function BMISetupScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return "#3498db"; // Blue for underweight
    if (bmi < 25) return "#2ecc71"; // Green for normal
    if (bmi < 30) return "#f1c40f"; // Yellow for overweight
    return "#e74c3c"; // Red for obese
  };

  const handleNext = async () => {
    if (!height || !weight || !age || !gender) {
      setError("Please fill in all fields");
      return;
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);
    const ageNum = Number(age);

    if (heightNum < 100 || heightNum > 250) {
      setError("Please enter a valid height in cm (100-250)");
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      setError("Please enter a valid weight in kg (30-300)");
      return;
    }

    if (ageNum < 13 || ageNum > 120) {
      setError("Please enter a valid age between 13 and 120");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const bmi = calculateBMI(weightNum, heightNum);
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error("No authenticated user found");
      }

      await updateDoc(doc(usersCollection, userId), {
        "profile.height": heightNum,
        "profile.weight": weightNum,
        "profile.age": ageNum,
        "profile.bmi": bmi,
        "profile.gender": gender,
      });

      router.push("./goal-settings");
    } catch (err) {
      console.error("Error updating BMI data:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bmi =
    height && weight ? calculateBMI(Number(weight), Number(height)) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;
  const bmiColor = bmi ? getBMIColor(bmi) : "#000";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Let's Calculate Your BMI</Text>
      <Text style={styles.subtitle}>
        This will help us create a personalized fitness plan for you
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {(["male", "female"] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.genderButton,
                gender === option && styles.genderButtonSelected,
              ]}
              onPress={() => setGender(option)}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === option && styles.genderButtonTextSelected,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your height"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>

      {bmi && (
        <View style={styles.resultContainer}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi}</Text>
          <Text style={[styles.bmiCategory, { color: bmiColor }]}>
            {bmiCategory}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
    marginVertical: 30,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  bmiLabel: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bmiCategory: {
    fontSize: 24,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "#e74c3c",
    marginBottom: 20,
    textAlign: "center",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
    alignItems: "center",
  },
  genderButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  genderButtonText: {
    color: "#333",
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: "#fff",
  },
});
