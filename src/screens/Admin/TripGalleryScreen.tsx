import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Admin, GALLERY, absUrl, pickUploadImage } from "../../api/admin";
import { describeError } from "../../api/client";
import { Button, Empty, ErrorView, Loading } from "../../components/ui";
import { colors } from "../../theme";
import type { TripImage } from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "AdminGallery">;
const GAP = 10;
const SIZE = (Dimensions.get("window").width - GAP * 3) / 2;

export default function TripGalleryScreen({ route }: Props) {
  const { tripId } = route.params;
  const qc = useQueryClient();
  const key = ["admin", GALLERY.resource, tripId];
  const q = useQuery({
    queryKey: key,
    queryFn: () =>
      Admin.list<TripImage>(GALLERY.resource, {
        [GALLERY.parentField]: tripId,
        page_size: 100,
      }),
  });
  const [progress, setProgress] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["trip"] });
  };

  const del = useMutation({
    mutationFn: (id: number) => Admin.remove(GALLERY.resource, id),
    onSuccess: refresh,
    onError: (e) => Alert.alert("Could not delete", describeError(e)),
  });
  const confirmDelete = (id: number) =>
    Alert.alert("Delete photo?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => del.mutate(id) },
    ]);

  if (q.isLoading) return <Loading />;
  if (q.isError)
    return (
      <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />
    );
  const photos = q.data?.results ?? [];
  const allowMultiple = true;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={photos}
        numColumns={2}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: GAP, paddingBottom: 100 }}
        columnWrapperStyle={{ gap: GAP }}
        refreshing={q.isRefetching}
        onRefresh={() => q.refetch()}
        ListEmptyComponent={
          <Empty text="No photos yet. Add some to make this trip stand out." />
        }
        renderItem={({ item }) => (
          <View style={{ width: SIZE, marginBottom: GAP }}>
            <Image
              source={{ uri: absUrl(item.image) }}
              style={{
                width: SIZE,
                height: SIZE,
                borderRadius: 12,
                backgroundColor: colors.border,
              }}
            />
            <Pressable
              onPress={() => confirmDelete(item.id)}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                backgroundColor: "#000A",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>✕</Text>
            </Pressable>
          </View>
        )}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 14,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Button
          title={progress ?? "+ Add photos"}
          onPress={() => pickUploadImage({allowMultiple, tripId, setProgress, refresh})}
          loading={!!progress}
        />
      </View>
    </View>
  );
}
