import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Admin } from "../../api/admin";
import { describeError } from "../../api/client";
import { Button, Badge, ErrorView, Loading, SectionTitle } from "../../components/ui";
import { colors } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";
import { MenuRow } from "./AdminHomeScreen";

/** Hub for one trip: edit core details, then manage each related collection. */
export default function TripManageScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminTripManage">) {
  const { id } = route.params;

  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "trips", "detail", id],
    queryFn: () => Admin.get<any>("trips", id),
  });

  const publish = useMutation({
    mutationFn: (is_published: boolean) =>
      Admin.update("trips", id, { is_published }),
    onSuccess: () => qc.invalidateQueries(),
    onError: (e) => Alert.alert("Could not update", describeError(e)),
  });

  const del = useMutation({
    mutationFn: () => Admin.remove("trips", id),
    onSuccess: () => {
      qc.invalidateQueries();
      navigation.goBack();
    },
    onError: (e) => Alert.alert("Could not delete", describeError(e)),
  });
    
  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data)
    return (
      <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />
    );
  const t = q.data;
  const parent = { field: "trip", id };

  return (
    <ScrollView contentContainerStyle={{ padding: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
        {t.title}
      </Text>
      <Text style={{ color: colors.muted, marginVertical: 6 }}>
        {[t.operator_name, t.destination].filter(Boolean).join(" · ")}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Badge
          label={t.is_published ? "Published" : "Hidden"}
          color={t.is_published ? colors.success : colors.warn}
        />
        <Badge
          label={t.trip_type === "trip" ? "Guided trip" : "Accommodation offer"}
          color={colors.primary}
        />
      </View>

      <SectionTitle>Manage</SectionTitle>
      <MenuRow
        title="Trip details"
        subtitle="Title, duration, deposit, payment, visibility"
        onPress={() =>
          navigation.navigate("AdminForm", { resource: "trips", id })
        }
      />
      <MenuRow
        title="Pricing options"
        subtitle="Self-drive vs transport, residents vs non-residents…"
        onPress={() =>
          navigation.navigate("AdminList", {
            resource: "pricing-options",
            title: "Pricing options",
            parent,
          })
        }
      />
      {t.trip_type === "trip" ? (
        <MenuRow
          title="Departures"
          subtitle="Dates, capacity and status"
          onPress={() =>
            navigation.navigate("AdminList", {
              resource: "departures",
              title: "Departures",
              parent,
            })
          }
        />
      ) : null}
      <MenuRow
        title="Inclusions & exclusions"
        onPress={() =>
          navigation.navigate("AdminList", {
            resource: "trip-items",
            title: "Inclusions & exclusions",
            parent,
          })
        }
      />
      <MenuRow
        title="Gallery"
        subtitle="Upload and remove photos"
        onPress={() =>
          navigation.navigate("AdminGallery", { tripId: id, title: t.title })
        }
      />
      <MenuRow
        title="Preview"
        subtitle="See what end users will see"
        onPress={() => 
          navigation.navigate("TripDetail", { slug: t.slug, title: t.title })
        }
      />
      <View style={{ marginTop: 10, gap: 10 }}>
        <Button
          variant="outline"
          title={t.is_published ? "Unpublish (hide from app)" : "Publish"}
          loading={publish.isPending}
          onPress={() => publish.mutate(!t.is_published)}
        />
        <Button
          variant="danger"
          title="Delete trip"
          loading={del.isPending}
          onPress={() =>
            Alert.alert(
              "Delete this trip?",
              "Its prices, departures and photos are deleted too. Trips with bookings cannot be deleted; unpublish them instead.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => del.mutate(),
                },
              ],
            )
          }
        />
      </View>
    </ScrollView>
  );
}
