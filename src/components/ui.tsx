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
  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "danger"
        ? colors.dangerSoft
        : "transparent";
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
          opacity: off ? 0.55 : pressed ? 0.95 : 1,
          shadowColor: colors.shadow,
          shadowOpacity: pressed ? 0.08 : 0.12,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
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
        placeholderTextColor={colors.textSoft}
        style={[
          s.input,
          error ? { borderColor: colors.danger, backgroundColor: colors.dangerSoft } : null,
        ]}
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
          shadowColor: colors.shadow,
          shadowOpacity: 0.1,
          shadowRadius: 10,
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
      <Text style={{ color: colors.danger, textAlign: "center", marginBottom: 12 }}>
        {message}
      </Text>
      {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

export const Empty = ({ text }: { text: string }) => (
  <View style={s.center}>
    <Text style={{ color: colors.textSoft, textAlign: "center" }}>{text}</Text>
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
  const st = styleFor(trip.category ?? "Wildlife Safaris");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        {
          padding: 0,
          overflow: "hidden",
          opacity: pressed ? 0.96 : 1,
          borderWidth: 0,
          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 12 },
        },
      ]}
    >
      {trip.cover_image ? (
        <View style={{ flex: 1, aspectRatio: 16 / 10, overflow: "hidden" }}>
          <Image
            source={getImageUrl(trip.cover_image)}
            style={{ flex: 1, width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        </View>
      ) : (
        <View style={[s.banner, { backgroundColor: st.bg }]}> 
          <Text style={{ fontSize: 46 }}>{st.emoji}</Text>
        </View>
      )}

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={s.meta}>{trip.operator}</Text>
          <Badge label={trip.category ?? "Safari"} color={st.accent} />
        </View>

        <Text style={s.title}>{trip.title}</Text>

        <Text style={[s.meta, { marginBottom: 8 }]}>
          {trip.destination} · {duration(trip)}
        </Text>

        <View style={s.row}>
          <Text style={s.price}>
            {trip.from_price
              ? `${trip.trip_type === "accommodation" ? "From " : ""}${money(trip.from_price)}`
              : ""}
          </Text>

          <Text style={[s.meta, { textAlign: "right" }]}>
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

export function StatPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primarySoft,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <View style={{ marginLeft: 8 }}>
        <Text style={{ fontSize: 10, color: colors.textSoft, fontWeight: "600" }}>{label}</Text>
        <Text style={{ fontSize: 12, color: colors.text, fontWeight: "700" }}>{value}</Text>
      </View>
    </View>
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
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: colors.surfaceMuted,
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
              style={{ width: width - 32, height: "100%" }}
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

      {images?.length >= 2 && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {images.map((img: any, i: number) => (
            <Pressable
              key={img.id}
              onPress={() => {
                setIndex(i);
                setVisible(true);
              }}
              style={{
                flex: 1,
                aspectRatio: 1.8,
                borderRadius: 10,
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
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontWeight: "800", fontSize: 16 },
  label: {
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  err: { color: colors.danger, marginTop: 4, fontSize: 12, fontWeight: "600" },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
  },
  chipText: { color: colors.text, fontWeight: "700", fontSize: 13 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  banner: { height: 190, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  meta: { color: colors.textSoft, fontSize: 13, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  price: { fontSize: 18, fontWeight: "800", color: colors.primary },
});
