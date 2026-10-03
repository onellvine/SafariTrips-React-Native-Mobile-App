import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../auth/AuthContext";
import { Card, Empty } from "../../components/ui";
import { colors } from "../../theme";
import type { AdminResource, RootStackParamList } from "../../navigation/types";

export function MenuRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ flex: 1 }}>
          <Text style={{ fontWeight: "800", fontSize: 16, color: colors.text }}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: colors.muted }}>
              {"\n"}
              {subtitle}
            </Text>
          ) : null}
        </Text>
        <Text style={{ fontSize: 22, color: colors.muted }}>›</Text>
      </Card>
    </Pressable>
  );
}

const ENTRIES: { resource: AdminResource; title: string; subtitle: string }[] =
  [
    {
      resource: "trips",
      title: "Trips",
      subtitle: "Prices, dates, inclusions and photos",
    },
    {
      resource: "operators",
      title: "Operators",
      subtitle: "Tour companies and contact details",
    },
    {
      resource: "categories",
      title: "Categories",
      subtitle: "Day hikes, safaris, beach…",
    },
    {
      resource: "payment-accounts",
      title: "Payment accounts",
      subtitle: "M-PESA Paybill and Till numbers",
    },
  ];

export default function AdminHomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminHome">) {
  const { user } = useAuth();
  if (!user?.is_staff) return <Empty text="Staff access only." />;
  return (
    <ScrollView contentContainerStyle={{ padding: 14 }}>
      {ENTRIES.map((e) => (
        <MenuRow
          key={e.resource}
          title={e.title}
          subtitle={e.subtitle}
          onPress={() =>
            navigation.navigate("AdminList", {
              resource: e.resource,
              title: e.title,
            })
          }
        />
      ))}
    </ScrollView>
  );
}
