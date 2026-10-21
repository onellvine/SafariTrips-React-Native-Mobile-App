import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Loading, SectionTitle } from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading, signOut } = useAuth();

  if (loading) return <Loading />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 80 }}>
        {user ? (
          <>
            <Card style={{ alignItems: "center", paddingVertical: 22 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: colors.primarySoft,
                  borderRadius: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 30 }}>👤</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text, marginTop: 14 }}>
                {user.first_name} {user.last_name}
              </Text>
              <Text style={{ color: colors.textSoft, fontWeight: "700", marginTop: 4 }}>{user.email}</Text>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <SectionTitle>Account</SectionTitle>
              <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>Saved trips</Text>
              <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>Travel preferences</Text>
              <Text style={{ color: colors.text, fontWeight: "700" }}>Notifications</Text>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <SectionTitle>Support</SectionTitle>
              <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>Help center</Text>
              <Text style={{ color: colors.text, fontWeight: "700", marginBottom: 8 }}>Contact support</Text>
              <Text style={{ color: colors.text, fontWeight: "700" }}>Privacy policy</Text>
            </Card>

            {user.is_staff ? (
              <Button title="Staff admin" onPress={() => nav.navigate("AdminHome")} style={{ marginTop: 16, marginBottom: 12 }} />
            ) : null}

            <Button title="Sign out" variant="outline" onPress={signOut} />
          </>
        ) : (
          <Card>
            <Text style={{ marginBottom: 12, color: colors.text, fontWeight: "700" }}>
              Sign in to book trips and track your payments.
            </Text>
            <Button title="Sign in" onPress={() => nav.navigate("Login")} />
            <View style={{ height: 10 }} />
            <Button title="Create account" variant="outline" onPress={() => nav.navigate("Register")} />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
