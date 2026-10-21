import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, Button, Card, Empty, ErrorView, Loading } from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { fmtDate, money, statusInfo } from "../utils/format";

export default function BookingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const q = useQuery({ queryKey: ["bookings"], queryFn: Api.bookings, enabled: !!user });

  if (!user)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
        <Text style={{ marginBottom: 14, color: colors.textSoft, textAlign: "center" }}>
          Sign in to see and manage your bookings.
        </Text>
        <Button title="Sign in" onPress={() => nav.navigate("Login")} />
      </View>
    );

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={q.data?.results ?? []}
        keyExtractor={(b) => b.reference}
        contentContainerStyle={{ padding: 18, paddingBottom: 80 }}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        ListEmptyComponent={<Empty text="No bookings yet. Explore trips and book your first adventure!" />}
        renderItem={({ item: b }) => (
          <Pressable onPress={() => nav.navigate("BookingDetail", { reference: b.reference })}>
            <Card>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ color: colors.textSoft, fontWeight: "700" }}>{b.reference}</Text>
                <Badge label={statusInfo[b.status].label} color={statusInfo[b.status].color} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>{b.trip}</Text>
              <Text style={{ color: colors.textSoft, marginTop: 4 }}>
                {fmtDate(b.start_date)} · {b.num_participants} traveller{b.num_participants > 1 ? "s" : ""}
              </Text>
              <Text style={{ marginTop: 8, fontWeight: "700", color: colors.primary }}>{money(b.total_amount, b.currency)}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
