import React from "react";
import { Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, Loading } from "../components/ui";
import { colors } from "../theme";
import { API_URL } from "../config";
import type { RootStackParamList } from "../navigation/types";

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading, signOut } = useAuth();
  if (loading) return <Loading />;
  return (
    <View style={{ padding: 16 }}>
      {user ? (
        <>
          <Card>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>
              {user.email}
            </Text>
          </Card>
          {/* <Button title="Sign out" variant="outline" onPress={signOut} /> */}
          {user.is_staff ? (
            <Button
              title="Staff admin"
              onPress={() => nav.navigate("AdminHome")}
              style={{ marginBottom: 12 }}
            />
          ) : null}
          <Button title="Sign out" variant="outline" onPress={signOut} />
        </>
      ) : (
        <Card>
          <Text style={{ marginBottom: 12 }}>
            Sign in to book trips and track your payments.
          </Text>
          <Button title="Sign in" onPress={() => nav.navigate("Login")} />
          <View style={{ height: 10 }} />
          <Button
            title="Create account"
            variant="outline"
            onPress={() => nav.navigate("Register")}
          />
        </Card>
      )}
      <Text
        style={{
          color: colors.muted,
          fontSize: 11,
          marginTop: 24,
          textAlign: "center",
        }}
      >
        API: {API_URL}
      </Text>
    </View>
  );
}
