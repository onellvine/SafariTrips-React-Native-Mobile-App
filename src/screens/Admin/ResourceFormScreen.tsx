import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Admin } from "../../api/admin";
import { describeError } from "../../api/client";
import { Button, ErrorView, Loading, s } from "../../components/ui";
import type { RootStackParamList } from "../../navigation/types";
import {
  DynamicForm,
  Errors,
  Values,
  apiErrors,
  initialValues,
  toPayload,
  validate,
} from "./DynamicForm";
import { RESOURCES } from "./resources";

export default function ResourceFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "AdminForm">) {
  const { resource, id, parent } = route.params;
  const cfg = RESOURCES[resource];
  const qc = useQueryClient();
  const editing = id !== undefined;

  const rec = useQuery({
    queryKey: ["admin", resource, "detail", id],
    queryFn: () => Admin.get<any>(resource, id!),
    enabled: editing,
  });
  const [values, setValues] = useState<Values | null>(
    editing ? null : initialValues(cfg.fields),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [general, setGeneral] = useState("");

  useEffect(() => {
    if (rec.data) setValues(initialValues(cfg.fields, rec.data));
  }, [rec.data]);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${editing ? "Edit" : "New"} ${cfg.singular}`,
    });
  }, [navigation, editing]);

  // Admin changes affect both staff lists and the public catalogue.
  const refreshCaches = () =>
    ["admin", "admin-options", "trips", "trip", "departures"].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k] }),
    );

  const save = useMutation({
    mutationFn: (body: Values) => {
      // console.log(JSON.stringify(body));
      return editing
        ? Admin.update<any>(resource, id!, body)
        : Admin.create<any>(resource, {
            ...body,
            ...(parent ? { [parent.field]: parent.id } : {}),
          })
    },
    onSuccess: (saved) => {
      refreshCaches();
      if (!editing && resource === "trips")
        navigation.replace("AdminTripManage", { id: saved.id }); // continue with prices, dates, photos
      else navigation.goBack();
    },
    onError: (e) => {
      const r = apiErrors(e);
      setErrors(r.errors);
      setGeneral(r.general);
    },
  });

  const remove = useMutation({
    mutationFn: () => Admin.remove(resource, id!),
    onSuccess: () => {
      refreshCaches();
      if (resource === "trips")
        navigation.popTo("AdminList", { resource: "trips" });
      else navigation.goBack();
    },
    onError: (e) => Alert.alert("Could not delete", describeError(e)),
  });

  const submit = () => {
    const v = validate(cfg.fields, values!);
    setErrors(v);
    setGeneral("");
    if (Object.keys(v).length === 0)
      save.mutate(toPayload(cfg.fields, values!));
  };
  const confirmDelete = () =>
    Alert.alert(
      `Delete this ${cfg.singular}?`,
      resource === "trips"
        ? "Its prices, dates, items and photos are deleted too."
        : "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => remove.mutate(),
        },
      ],
    );

  if (editing && rec.isError)
    return (
      <ErrorView
        message={describeError(rec.error)}
        onRetry={() => rec.refetch()}
      />
    );
  if (!values) return <Loading />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <DynamicForm
          fields={cfg.fields}
          values={values}
          errors={errors}
          onChange={(k, v) => setValues((p) => ({ ...p!, [k]: v }))}
        />
        {general ? (
          <Text style={[s.err, { marginBottom: 12 }]}>{general}</Text>
        ) : null}
        <Button
          title={editing ? "Save changes" : `Create ${cfg.singular}`}
          onPress={submit}
          loading={save.isPending}
        />
        {editing ? (
          <View style={{ marginTop: 14 }}>
            <Button
              title={`Delete ${cfg.singular}`}
              variant="danger"
              onPress={confirmDelete}
              loading={remove.isPending}
            />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
