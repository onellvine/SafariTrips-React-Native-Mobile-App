import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
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
  { label: "Price: low → high", value: "from_price" },
  { label: "Price: high → low", value: "-from_price" },
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
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, paddingBottom: 4 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Search trips, places, operators…"
          placeholderTextColor={colors.muted}
          style={s.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          <Chip
            label="All"
            active={!category}
            onPress={() => setCategory(undefined)}
          />
          {cats.data?.map((c) => (
            <Chip
              key={c.slug}
              label={c.name}
              active={category === c.slug}
              onPress={() => setCategory(c.slug)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        >
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
      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <ErrorView
          message={describeError(q.error)}
          onRetry={() => q.refetch()}
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => t.slug}
          contentContainerStyle={{ padding: 12 }}
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
          refreshing={q.isRefetching && !q.isFetchingNextPage}
          onRefresh={() => q.refetch()}
          onEndReached={() =>
            q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()
          }
          onEndReachedThreshold={0.5}
          ListEmptyComponent={<Empty text="No trips match your search." />}
          ListFooterComponent={
            q.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}
