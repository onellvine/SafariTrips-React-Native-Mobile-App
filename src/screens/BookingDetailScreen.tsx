import React, { useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Api } from "../api/endpoints";
import { describeError } from "../api/client";
import {
  Badge,
  Button,
  Card,
  ErrorView,
  Field,
  Loading,
  SectionTitle,
} from "../components/ui";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { fmtDate, money, statusInfo } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "BookingDetail">;
const payColor = {
  pending: colors.warn,
  verified: colors.success,
  rejected: colors.danger,
} as const;

export default function BookingDetailScreen({ route }: Props) {
  const ref = route.params.reference;
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["booking", ref],
    queryFn: () => Api.booking(ref),
  });
  const [receipt, setReceipt] = useState("");
  const [amount, setAmount] = useState("");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["booking", ref] });
    qc.invalidateQueries({ queryKey: ["bookings"] });
  };
  const pay = useMutation({
    mutationFn: (b: { amount: string; mpesa_receipt: string }) =>
      Api.reportPayment(ref, b),
    onSuccess: () => {
      setReceipt("");
      setAmount("");
      refresh();
      Alert.alert(
        "Thanks!",
        "We received your M-PESA code and will verify it shortly.",
      );
    },
    onError: (e) => Alert.alert("Could not submit", describeError(e)),
  });
  const cancel = useMutation({
    mutationFn: () => Api.cancelBooking(ref),
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ["departures"] });
    },
    onError: (e) => Alert.alert("Could not cancel", describeError(e)),
  });

  if (q.isLoading) return <Loading />;
  if (q.isError || !q.data)
    return (
      <ErrorView message={describeError(q.error)} onRetry={() => q.refetch()} />
    );
  const b = q.data;
  const st = statusInfo[b.status];
  const owing =
    Math.max(Number(b.deposit_amount) - Number(b.paid_amount), 0) ||
    Number(b.balance);
  const active = b.status !== "cancelled";
  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", text);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
        />
      }
    >
      <Badge label={st.label} color={st.color} />
      <Text style={{ fontSize: 22, fontWeight: "800", marginTop: 8 }}>
        {b.trip}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 4 }}>
        {fmtDate(b.start_date)} · {b.num_participants} traveller
        {b.num_participants > 1 ? "s" : ""}
      </Text>

      <Card style={{ marginTop: 14 }}>
        {(
          [
            ["Total", b.total_amount],
            ["Deposit required", b.deposit_amount],
            ["Paid (verified)", b.paid_amount],
            ["Balance", b.balance],
          ] as const
        ).map(([k, v]) => (
          <View
            key={k}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: colors.muted }}>{k}</Text>
            <Text style={{ fontWeight: "700" }}>{money(v, b.currency)}</Text>
          </View>
        ))}
      </Card>

      {active && b.status !== "paid" && b.payment_instructions ? (
        <>
          <SectionTitle>How to pay (M-PESA)</SectionTitle>
          <Card style={{ backgroundColor: "#EAF4EE" }}>
            <Text style={{ lineHeight: 21 }}>
              {b.payment_instructions.text}
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outline"
                title={`Copy ${b.payment_instructions.kind === "till" ? "Till" : "Paybill"} no.`}
                onPress={() => copy(b.payment_instructions!.number)}
              />
              {b.payment_instructions.account_name ? (
                <Button
                  variant="outline"
                  title="Copy account"
                  onPress={() => copy(b.payment_instructions!.account_name)}
                />
              ) : null}
            </View>
          </Card>

          <SectionTitle>I've paid</SectionTitle>
          <Field
            label="M-PESA receipt code"
            value={receipt}
            onChangeText={(v) => setReceipt(v.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
            placeholder="e.g. SGH7K2L9QX"
          />
          <Field
            label={`Amount paid (${b.currency})`}
            value={amount || String(owing)}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Button
            title="Submit payment"
            loading={pay.isPending}
            disabled={receipt.length !== 10}
            onPress={() =>
              pay.mutate({
                mpesa_receipt: receipt,
                amount: amount || String(owing),
              })
            }
          />
        </>
      ) : null}

      {b.payments.length ? (
        <>
          <SectionTitle>Payments</SectionTitle>
          {b.payments.map((p) => (
            <Card
              key={p.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontWeight: "700" }}>{p.mpesa_receipt}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {money(p.amount, b.currency)}
                </Text>
              </View>
              <Badge
                label={
                  p.status === "pending"
                    ? "Awaiting verification"
                    : p.status === "verified"
                      ? "Verified"
                      : "Rejected"
                }
                color={payColor[p.status]}
              />
            </Card>
          ))}
        </>
      ) : null}

      {active ? (
        <Button
          style={{ marginTop: 20 }}
          variant="danger"
          title="Cancel booking"
          loading={cancel.isPending}
          onPress={() =>
            Alert.alert(
              "Cancel booking?",
              "Refunds are handled directly by the operator.",
              [
                { text: "Keep booking", style: "cancel" },
                {
                  text: "Cancel booking",
                  style: "destructive",
                  onPress: () => cancel.mutate(),
                },
              ],
            )
          }
        />
      ) : null}
    </ScrollView>
  );
}
