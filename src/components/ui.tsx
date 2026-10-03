import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import ImageView from "react-native-image-viewing";

import { colors, radius, styleFor } from "../theme";
import type { TripSummary } from "../types";
import { duration, fmtDate, getImageUrl, money } from "../utils/format";

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  const bg = variant === "primary" ? colors.primary : "transparent";
  const fg =
    variant === "primary"
      ? "#fff"
      : variant === "danger"
        ? colors.danger
        : colors.primary;
  const border =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.danger
        : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: off ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[s.btnText, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[s.input, error ? { borderColor: colors.danger } : null]}
        {...props}
      />
      {error ? <Text style={s.err}>{error}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        s.chip,
        active && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
    >
      <Text style={[s.chipText, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + "22" }]}>
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export const Loading = () => (
  <View style={s.center}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={s.center}>
      <Text
        style={{ color: colors.danger, textAlign: "center", marginBottom: 12 }}
      >
        {message}
      </Text>
      {onRetry ? (
        <Button title="Try again" variant="outline" onPress={onRetry} />
      ) : null}
    </View>
  );
}

export const Empty = ({ text }: { text: string }) => (
  <View style={s.center}>
    <Text style={{ color: colors.muted, textAlign: "center" }}>{text}</Text>
  </View>
);

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[s.card, style]}>{children}</View>;

export const SectionTitle = ({ children }: { children: string }) => (
  <Text style={s.section}>{children}</Text>
);

export function TripCard({
  trip,
  onPress,
}: {
  trip: TripSummary;
  onPress: () => void;
}) {
  const st = styleFor(trip.category);
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        { padding: 0, overflow: "hidden", opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {trip.cover_image ? (
        <View
          style={{
            flex: 1,
            aspectRatio: 16 / 9,
            overflow: "hidden",
          }}
        >
          <Image
            source={getImageUrl(trip.cover_image)}
            style={{ flex: 1, width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
            // debug - remove after
            onError={(e) =>
              console.log(
                "IMG ERROR",
                e.error,
                getImageUrl(trip.cover_image),
              )
            }
          />
        </View>
      ) : (
        <View style={[s.banner, { backgroundColor: st.bg }]}>
          <Text style={{ fontSize: 44 }}>{st.emoji}</Text>
        </View>
      )}

      <View style={{ padding: 14 }}>
        <Text style={s.meta}>
          {trip.operator} · {trip.category}
        </Text>
        <Text style={s.title}>{trip.title}</Text>
        <Text style={s.meta}>
          {trip.destination} · {duration(trip)}
        </Text>
        <View style={s.row}>
          <Text style={s.price}>
            {trip.from_price
              ? `${trip.trip_type === "accommodation" ? "From " : ""}${money(trip.from_price)}`
              : ""}
          </Text>
          <Text style={s.meta}>
            {trip.next_departure
              ? `Next: ${fmtDate(trip.next_departure, false)}`
              : trip.valid_until
                ? `Valid until ${fmtDate(trip.valid_until)}`
                : ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function TripGallery({ images }: { images: any[] }) {
  const { width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 10,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <FlatList
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={images}
          keyExtractor={(i) => String(i.id)}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(newIndex);
          }}
          renderItem={({ item, index: i }) => (
            <Pressable
              onPress={() => {
                setIndex(i);
                setVisible(true);
              }}
              style={{ width: width, height: "100%" }}
            >
              <Image
                source={item.image_url}
                style={{ flex: 1, width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          )}
        />
      </View>

      {/* Show the thumb strip when the trip gallery has at least 2 images */}
      {images?.length >= 2 && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          {images.map((img: any, i: number) => (
            <Pressable
              key={img.id}
              onPress={() => {
                setIndex(i);
                setVisible(true);
              }}
              style={{
                flex: 1,
                aspectRatio: 1.78,
                borderRadius: 8,
                overflow: "hidden",
                opacity: i === index ? 1 : 0.6,
              }}
            >
              <Image
                source={img.image_url}
                style={{ flex: 1, width: "100%" }}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </View>
      )}

      <ImageView
        images={images.map((img: any) => ({ uri: img.image_url }))}
        imageIndex={index}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled
      />
    </View>
  );
}

export const s = StyleSheet.create({
  btn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontWeight: "700", fontSize: 16 },
  label: { fontWeight: "600", color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.text,
  },
  err: { color: colors.danger, marginTop: 4, fontSize: 13 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginTop: 8,
    marginBottom: 10,
  },
  banner: { height: 196, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginVertical: 4,
  },
  meta: { color: colors.muted, fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: { fontSize: 16, fontWeight: "800", color: colors.primary },
});
