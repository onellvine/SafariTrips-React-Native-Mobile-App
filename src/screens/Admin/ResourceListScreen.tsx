import React, { useLayoutEffect, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Admin } from "../../api/admin";
import { describeError } from "../../api/client";
import {
  Button,
  Card,
  Empty,
  ErrorView,
  Loading,
  s,
} from "../../components/ui";
import { colors } from "../../theme";
import type { RootStackParamList } from "../../navigation/types";
import { RESOURCES } from "./resources";

export default function ResourceListScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminList">) {
  const { resource, parent } = route.params;
  const cfg = RESOURCES[resource];
  const [search, setSearch] = useState("");
  const add = () => navigation.navigate("AdminForm", { resource, parent });

  const q = useQuery({
    queryKey: ["admin", resource, "list", parent?.id ?? null, search],
    queryFn: () =>
      Admin.list<any>(resource, {
        page_size: 100,
        ...(parent ? { [parent.field]: parent.id } : {}),
        search: search.trim() || undefined,
      }),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={add} hitSlop={10}>
          <Text
            style={{ color: colors.primary, fontWeight: "800", fontSize: 16 }}
          >
            ＋ Add
          </Text>
        </Pressable>
      ),
    });
  });

  const open = (rec: any) =>
    resource === "trips"
      ? navigation.navigate("AdminTripManage", { id: rec.id })
      : navigation.navigate("AdminForm", { resource, id: rec.id, parent });

  return (
    <View style={{ flex: 1 }}>
      {cfg.search ? (
        <View style={{ padding: 12, paddingBottom: 0 }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${cfg.plural.toLowerCase()}…`}
            placeholderTextColor={colors.muted}
            style={s.input}
          />
        </View>
      ) : null}
      {q.isLoading ? (
        <Loading />
      ) : q.isError ? (
        <ErrorView
          message={describeError(q.error)}
          onRetry={() => q.refetch()}
        />
      ) : (
        <FlatList
          data={q.data?.results ?? []}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={{ padding: 12, flexGrow: 1 }}
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          ListEmptyComponent={
            <View style={{ flex: 1 }}>
              <Empty text={`No ${cfg.plural.toLowerCase()} yet.`} />
              <Button title={`Add ${cfg.singular}`} onPress={add} />
            </View>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => open(item)}>
              <Card>
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  {cfg.title(item)}
                </Text>
                {cfg.subtitle ? (
                  <Text style={{ color: colors.muted, marginTop: 3 }}>
                    {cfg.subtitle(item)}
                  </Text>
                ) : null}
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
