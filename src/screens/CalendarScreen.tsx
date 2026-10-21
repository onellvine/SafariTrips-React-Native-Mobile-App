import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, SectionList, Text, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import { Badge, Card, Empty, ErrorView, Loading } from "../components/ui";
import { colors } from "../theme";
import type { Departure } from "../types";
import type { RootStackParamList } from "../navigation/types";
import { fmtRange, monthKey } from "../utils/format";

export default function CalendarScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const q = useInfiniteQuery({
    queryKey: ["departures"],
    queryFn: ({ pageParam }) => Api.departures(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.next ? all.length + 1 : undefined),
  });

  const sections = useMemo(() => {
    const map = new Map<string, Departure[]>();
    q.data?.pages.flatMap((p) => p.results).forEach((d) => {
      const k = monthKey(d.start_date);
      map.set(k, [...(map.get(k) ?? []), d]);
    });
    return [...map].map(([title, data]) => ({ title, data }));
  }, [q.data]);

  if (q.isLoading) return <Loading />;
  if (q.isError) return <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ padding: 18, paddingBottom: 80 }}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        stickySectionHeadersEnabled={false}
        onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
        ListEmptyComponent={<Empty text="No upcoming departures." />}
        ListFooterComponent={q.isFetchingNextPage ? <ActivityIndicator color={colors.primary} /> : null}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 15, fontWeight: "800", color: colors.textSoft, marginVertical: 12 }}>
            {section.title.toUpperCase()}
          </Text>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => nav.navigate("TripDetail", { slug: item.trip_slug, title: item.trip_title })}>
            <Card>
              <Text style={{ fontWeight: "800", fontSize: 16, color: colors.text }}>{item.trip_title}</Text>
              <Text style={{ color: colors.textSoft, marginVertical: 6 }}>{fmtRange(item.start_date, item.end_date)}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                <Badge
                  label={
                    item.status === "confirmed"
                      ? "Confirmed to run"
                      : item.status === "full"
                        ? "Full"
                        : "Open"
                  }
                  color={item.status === "full" ? colors.danger : item.status === "confirmed" ? colors.success : colors.accent}
                />
                {item.seats_left !== null ? (
                  <Text style={{ color: colors.textSoft, fontSize: 12, marginLeft: 10 }}>
                    {item.seats_left} seats left
                  </Text>
                ) : null}
              </View>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}
