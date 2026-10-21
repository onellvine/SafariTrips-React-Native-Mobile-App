import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import { Chip, Empty, ErrorView, Loading, TripCard, s } from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const SORTS = [
  { label: "Soonest", value: "next_departure" },
  { label: "Price ↓", value: "from_price" },
  { label: "Price ↑", value: "-from_price" },
];

export default function ExploreScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [ordering, setOrdering] = useState("next_departure");

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 350);
    return () => clearTimeout(t);
  }, [input]);

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: Api.categories,
    staleTime: 3_600_000,
  });

  const q = useInfiniteQuery({
    queryKey: ["trips", search, category, ordering],
    queryFn: ({ pageParam }) =>
      Api.trips({ search, category, ordering, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.next ? all.length + 1 : undefined),
  });

  const trips = q.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: colors.text, marginBottom: 2 }}>
            Discover safari escapes
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSoft, fontWeight: "600", marginBottom: 14 }}>
            Explore memorable trips, departures, and wildlife adventures
          </Text>

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: colors.shadow,
              shadowOpacity: 0.08,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 10 }}>🔎</Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Search trips, places, operators..."
              placeholderTextColor={colors.textSoft}
              style={{ flex: 1, fontSize: 15, color: colors.text }}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <View style={{ paddingLeft: 18, paddingTop: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
            Featured collections
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              style={{
                width: 220,
                height: 132,
                borderRadius: 22,
                backgroundColor: "#DDEEE2",
                padding: 16,
                marginRight: 12,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 28 }}>🦒</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Wildlife</Text>
                <Text style={{ fontSize: 12, color: colors.textSoft }}>Top picks</Text>
              </View>
            </Pressable>

            <Pressable
              style={{
                width: 220,
                height: 132,
                borderRadius: 22,
                backgroundColor: "#F7EBD7",
                padding: 16,
                marginRight: 12,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 28 }}>🏝️</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Coastal stays</Text>
                <Text style={{ fontSize: 12, color: colors.textSoft }}>Beach escapes</Text>
              </View>
            </Pressable>

            <Pressable
              style={{
                width: 220,
                height: 132,
                borderRadius: 22,
                backgroundColor: "#EDE7F8",
                padding: 16,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 28 }}>🏕️</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>Camping</Text>
                <Text style={{ fontSize: 12, color: colors.textSoft }}>Adventure</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
            Categories
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
            <Chip label="All" active={!category} onPress={() => setCategory(undefined)} />
            {cats.data?.map((c) => (
              <Chip
                key={c.slug}
                label={c.name}
                active={category === c.slug}
                onPress={() => setCategory(c.slug)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 10 }}>
            Sort by
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
            {SORTS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={ordering === o.value}
                onPress={() => setOrdering(o.value)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>Available trips</Text>
            <Text style={{ fontSize: 12, color: colors.textSoft, fontWeight: "700" }}>{trips.length} results</Text>
          </View>

          {q.isLoading ? (
            <Loading />
          ) : q.isError ? (
            <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(t) => t.slug}
              horizontal={false}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => (
                <TripCard
                  trip={item}
                  onPress={() =>
                    nav.navigate("TripDetail", {
                      slug: item.slug,
                      title: item.title,
                    })
                  }
                />
              )}
              ListEmptyComponent={<Empty text="No trips match your search." />}
              ListFooterComponent={
                q.isFetchingNextPage ? (
                  <View style={{ paddingVertical: 12 }}>
                    <ActivityIndicator color={colors.primary} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
