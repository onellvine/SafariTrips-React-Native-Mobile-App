import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Button, Card, ErrorView, Field, Loading, SectionTitle } from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { fmtRange, money, unitLabel } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Book">;

function Option({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {children}
    </Pressable>
  );
}

export default function BookScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["trip", route.params.slug],
    queryFn: () => Api.trip(route.params.slug),
  });
  const [depId, setDepId] = useState<number>();
  const [optId, setOptId] = useState<number>();
  const [people, setPeople] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(user ? `${user.first_name} ${user.last_name}`.trim() : "");

  const m = useMutation({
    mutationFn: Api.createBooking,
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["trip", route.params.slug] });
      qc.invalidateQueries({ queryKey: ["departures"] });
      navigation.replace("BookingDetail", { reference: b.reference });
    },
    onError: (e) => Alert.alert("Could not book", describeError(e)),
  });

  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data) return <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />;

  const t = q.data;
  const departures = t.upcoming_departures.filter((d) => d.is_bookable);
  const dep = departures.find((d) => d.id === (depId ?? (departures.length === 1 ? departures[0].id : undefined)));
  const opt = t.pricing_options.find((p) => p.id === (optId ?? (t.pricing_options.length === 1 ? t.pricing_options[0].id : undefined)));
  const maxPeople = dep?.seats_left ?? 20;

  const total = opt ? Number(opt.amount) * people : 0;
  const deposit =
    t.deposit.type === "percent"
      ? (total * Number(t.deposit.value)) / 100
      : Math.min(Number(t.deposit.value) * people, total);

  const submit = () => {
    if (!dep || !opt) return Alert.alert("Almost there", "Choose a departure date and a price option.");
    if (phone.replace(/\D/g, "").length < 9) return Alert.alert("Phone number", "Enter the phone number we can reach you on.");
    m.mutate({
      departure: dep.id,
      pricing_option: opt.id,
      num_participants: people,
      contact_phone: phone.trim(),
      contact_name: name.trim(),
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>{t.title}</Text>

      <SectionTitle>1. Choose a date</SectionTitle>
      {departures.map((d) => (
        <Option
          key={d.id}
          selected={dep?.id === d.id}
          onPress={() => {
            setDepId(d.id);
            setPeople((p) => Math.min(p, d.seats_left ?? 20));
          }}
        >
          <Text style={{ fontWeight: "700", color: colors.text }}>{fmtRange(d.start_date, d.end_date)}</Text>
          <Text style={{ color: colors.textSoft }}>{d.seats_left !== null ? `${d.seats_left} left` : ""}</Text>
        </Option>
      ))}

      <SectionTitle>2. Choose a price</SectionTitle>
      {t.pricing_options.map((p) => (
        <Option key={p.id} selected={opt?.id === p.id} onPress={() => setOptId(p.id)}>
          <View>
            <Text style={{ fontWeight: "700", color: colors.text }}>{p.name}</Text>
            <Text style={{ color: colors.textSoft, fontSize: 12 }}>{unitLabel[p.unit]}</Text>
          </View>
          <Text style={{ fontWeight: "800", color: colors.primary }}>{money(p.amount, p.currency)}</Text>
        </Option>
      ))}

      <SectionTitle>3. Travellers</SectionTitle>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 12 }}>
        <Button title="−" variant="outline" disabled={people <= 1} onPress={() => setPeople((p) => p - 1)} />
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{people}</Text>
        <Button title="+" variant="outline" disabled={people >= maxPeople} onPress={() => setPeople((p) => p + 1)} />
      </View>

      <Field label="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
      <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="07XX XXX XXX" />

      {opt ? (
        <Card style={{ backgroundColor: colors.primarySoft }}>
          <Text style={{ color: colors.text }}>
            Total: <Text style={{ fontWeight: "800" }}>{money(total, opt.currency)}</Text>
          </Text>
          <Text style={{ marginTop: 4, color: colors.text }}>
            Deposit to secure seats: <Text style={{ fontWeight: "800" }}>{money(deposit, opt.currency)}</Text>
          </Text>
        </Card>
      ) : null}

      <Button title="Confirm booking" onPress={submit} loading={m.isPending} disabled={!dep || !opt} style={{ marginTop: 18 }} />
      <Text style={{ color: colors.textSoft, textAlign: "center", marginTop: 10, fontSize: 12 }}>
        You’ll pay via M-PESA in the next step.
      </Text>
    </ScrollView>
  );
}
