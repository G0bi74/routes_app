import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { useUser } from "../../hooks/useUser";
import { Ionicons } from "@expo/vector-icons";

import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedCard from "../../components/ThemedCard";
import ThemedLogo from "../../components/ThemedLogo";
import { Colors } from "../../constants/Colors";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useUser();

  const handleSubmit = async () => {
    setError(null);
    try {
      await login(email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.container} safe>
        <View style={styles.content}>
          {}
          <View style={styles.logoContainer}>
            <ThemedLogo size={120} />
          </View>

          <ThemedText title style={styles.title}>
            Zaloguj się
          </ThemedText>

          <ThemedText style={styles.subtitle}>Witaj z powrotem!</ThemedText>

          <Spacer height={30} />

          {}
          <ThemedCard style={styles.formCard}>
            <ThemedTextInput
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              icon="mail-outline"
            />

            <Spacer height={12} />

            <ThemedTextInput
              placeholder="Hasło"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              icon="lock-closed-outline"
            />

            <Spacer height={20} />

            <ThemedButton onPress={handleSubmit} icon="log-in-outline">
              Zaloguj
            </ThemedButton>
          </ThemedCard>

          {}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={Colors.warning} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          <Spacer height={30} />

          {}
          <Link href={"/register"}>
            <ThemedText style={styles.link}>
              Nie masz konta?{" "}
              <ThemedText style={styles.linkBold}>Zarejestruj się</ThemedText>
            </ThemedText>
          </Link>
        </View>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6,
    marginTop: 8,
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.warning + "15",
    borderRadius: 12,
  },
  errorText: {
    color: Colors.warning,
    fontSize: 14,
    flex: 1,
  },
  link: {
    textAlign: "center",
    fontSize: 14,
  },
  linkBold: {
    fontWeight: "600",
    color: Colors.primary,
  },
});
