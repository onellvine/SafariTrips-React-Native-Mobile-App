import React from "react";
import { View, ScrollView, Text, FlatList, Image, Linking } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, Button, Card, ErrorView, Loading, SectionTitle, TripGallery } from "../components/ui";
import { colors, styleFor } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { duration, fmtDate, fmtRange, money, unitLabel } from "../utils/format";
import { useNavigation } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "TripDetail">;

export default function TripDetailScreen({ route, navigation }: Props) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const q = useQuery({
    queryKey: ["trip", route.params.slug],
    queryFn: () => Api.trip(route.params.slug),
  });

  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />;

  const t = q.data;
  const st = styleFor(t.category.name);
  const bookable =
    t.trip_type === "trip" &&
    t.upcoming_departures.some((d) => d.is_bookable) &&
    !t.is_expired;

  const depositText =
    t.deposit.type === "percent"
      ? Number(t.deposit.value) >= 100
        ? "Full payment at booking"
        : `${Number(t.deposit.value)}% deposit to secure your seat`
      : `${money(t.deposit.value)} per person deposit to secure your seat`;

  const book = () =>
    user ? navigation.navigate("Book", { slug: t.slug }) : navigation.navigate("Login");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View
          style={{
            minHeight: 230,
            backgroundColor: st.bg,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 18,
            paddingTop: 18,
          }}
        >
          {t.gallery_images.length === 0 ? (
            <Text style={{ fontSize: 60 }}>{st.emoji}</Text>
          ) : (
            <TripGallery images={t.gallery_images} />
          )}
        </View>

        <View style={{ padding: 18 }}>
          <Text style={{ color: colors.textSoft, fontWeight: "700" }}>{t.operator.name} · {t.category.name}</Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color: colors.text, marginVertical: 6 }}>{t.title}</Text>
          <Text style={{ color: colors.textSoft, fontWeight: "600" }}>
            {t.destination} · {duration(t)}
            {t.transport ? ` · ${t.transport}` : ""}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 12 }}>
            {t.min_participants ? <Badge label={`Min. ${t.min_participants} people`} color={colors.accent} /> : null}
            {t.covid_guidelines ? <Badge label="MoH guidelines observed" color={colors.primary} /> : null}
            {t.valid_until ? (
              <Badge
                label={`${t.is_expired ? "Expired" : "Valid until"} ${fmtDate(t.valid_until)}`}
                color={t.is_expired ? colors.danger : colors.warn}
              />
            ) : null}
          </View>

          {t.summary ? <Text style={{ marginTop: 14, color: colors.text, lineHeight: 22 }}>{t.summary}</Text> : null}
          {t.description ? <Text style={{ marginTop: 8, color: colors.text, lineHeight: 22 }}>{t.description}</Text> : null}

          {t.perks ? (
            <Card style={{ marginTop: 12, backgroundColor: colors.accentSoft }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>🎁 {t.perks}</Text>
            </Card>
          ) : null}

          <SectionTitle>Prices</SectionTitle>
          <Card>
            {t.pricing_options.map((p, i) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  borderTopWidth: i ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: colors.text }}>{p.name}</Text>
                  <Text style={{ color: colors.textSoft, fontSize: 12 }}>{unitLabel[p.unit]}</Text>
                </View>
                <Text style={{ fontWeight: "800", color: colors.primary }}>
                  {p.is_from_price ? "From " : ""}
                  {money(p.amount, p.currency)}
                </Text>
              </View>
            ))}
          </Card>

          {t.trip_type === "trip" ? (
            <>
              <SectionTitle>Departures</SectionTitle>
              {t.upcoming_departures.length === 0 ? (
                <Text style={{ color: colors.textSoft }}>No upcoming dates. Contact the operator.</Text>
              ) : (
                t.upcoming_departures.map((d) => (
                  <Card key={d.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "700", color: colors.text }}>{fmtRange(d.start_date, d.end_date)}</Text>
                    <Text style={{ color: d.status === "full" ? colors.danger : colors.textSoft }}>
                      {d.status === "full"
                        ? "Full"
                        : d.seats_left !== null
                          ? `${d.seats_left} seats left`
                          : d.status === "confirmed"
                            ? "Confirmed"
                            : "Open"}
                    </Text>
                  </Card>
                ))
              )}
            </>
          ) : null}

          {t.inclusions.length ? (
            <>
              <SectionTitle>Included</SectionTitle>
              <Card>
                {t.inclusions.map((x) => (
                  <Text key={x} style={{ paddingVertical: 3, color: colors.text }}>✅ {x}</Text>
                ))}
              </Card>
            </>
          ) : null}

          {t.exclusions.length ? (
            <>
              <SectionTitle>Not included</SectionTitle>
              <Card>
                {t.exclusions.map((x) => (
                  <Text key={x} style={{ paddingVertical: 3, color: colors.text }}>❌ {x}</Text>
                ))}
              </Card>
            </>
          ) : null}

          {t.trip_type === "trip" ? (
            <>
              <SectionTitle>Booking & payment</SectionTitle>
              <Card>
                <Text style={{ fontWeight: "600", color: colors.text }}>{depositText}</Text>
                {t.payment ? (
                  <Text style={{ color: colors.textSoft, marginTop: 6 }}>
                    Pay via M-PESA {t.payment.kind === "paybill" ? "Paybill" : "Till"} {t.payment.number}
                    {t.payment.account_name ? ` (Account: ${t.payment.account_name})` : ""}
                  </Text>
                ) : null}
              </Card>
            </>
          ) : null}

          <SectionTitle>{`Contact ${t.operator.name}`}</SectionTitle>
          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            {t.operator.phone ? (
              <Button variant="outline" title="Call" onPress={() => Linking.openURL(`tel:${t.operator.phone.replace(/\s/g, "")}`)} />
            ) : null}
            {t.operator.email ? (
              <Button variant="outline" title="Email" onPress={() => Linking.openURL(`mailto:${t.operator.email}`)} />
            ) : null}
            {t.operator.website ? (
              <Button variant="outline" title="Website" onPress={() => Linking.openURL(t.operator.website)} />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {t.trip_type === "trip" ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 14,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          {user?.is_staff ? (
            <Button title="Manage Trip" onPress={() => nav.navigate("AdminTripManage", { id: t.id })} style={{ marginBottom: 12 }} />
          ) : null}
          <Button title={bookable ? "Book now" : "Not available for booking"} disabled={!bookable} onPress={book} />
        </View>
      ) : null}
    </View>
  );
}
