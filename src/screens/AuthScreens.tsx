import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { describeError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Field } from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: colors.background }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingTop: 30, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Login">) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await signIn(email, password);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Sign in failed", describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <Text style={{ fontSize: 32, fontWeight: "900", marginBottom: 8, color: colors.text }}>
        Welcome back
      </Text>
      <Text style={{ fontSize: 15, color: colors.textSoft, marginBottom: 24 }}>
        Sign in to continue your safari journey
      </Text>

      <View style={{ backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18 }}>
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
      </View>

      <Button title="Sign in" onPress={submit} loading={busy} disabled={!email || !password} style={{ marginTop: 18 }} />
      <View style={{ height: 12 }} />
      <Button title="Create an account" variant="outline" onPress={() => navigation.replace("Register")} />
    </Shell>
  );
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Register">) {
  const { signUp } = useAuth();
  const [f, setF] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      await signUp(f);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Could not create account", describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <Text style={{ fontSize: 32, fontWeight: "900", marginBottom: 8, color: colors.text }}>
        Create account
      </Text>
      <Text style={{ fontSize: 15, color: colors.textSoft, marginBottom: 24 }}>
        Start booking your next unforgettable adventure
      </Text>

      <View style={{ backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18 }}>
        <Field label="First name" value={f.first_name} onChangeText={set("first_name")} autoCapitalize="words" />
        <Field label="Last name" value={f.last_name} onChangeText={set("last_name")} autoCapitalize="words" />
        <Field label="Email" value={f.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Password" value={f.password} onChangeText={set("password")} secureTextEntry />
      </View>

      <Text style={{ color: colors.textSoft, marginTop: 16, marginBottom: 14, fontSize: 12 }}>
        At least 8 characters, not a common password.
      </Text>
      <Button
        title="Create account"
        onPress={submit}
        loading={busy}
        disabled={!f.first_name || !f.email || f.password.length < 8}
      />
    </Shell>
  );
}
