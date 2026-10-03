import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Directory, File } from "expo-file-system";
import { useQuery } from "@tanstack/react-query";
import { Admin, GALLERY, selectImage } from "../../api/admin";
import { ApiError, describeError } from "../../api/client";
import { Button, Chip, Field, s } from "../../components/ui";
import { colors } from "../../theme";
import type { FieldDef, Option } from "./resources";

export type Values = Record<string, any>;
export type Errors = Record<string, string>;

export function initialValues(fields: FieldDef[], rec?: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    if (rec) {
      const v = rec[f.key];
      out[f.key] =
        f.type === "bool"
          ? !!v
          : f.type === "select"
            ? (v ?? null)
            : v == null
              ? ""
              : String(v);
    } else {
      out[f.key] =
        f.default ??
        (f.type === "bool" ? false : f.type === "select" ? null : "");
    }
  }
  return out;
}

export function validate(fields: FieldDef[], v: Values): Errors {
  const e: Errors = {};
  for (const f of fields) {
    const val = v[f.key];
    const empty = val === "" || val === null || val === undefined;
    if (empty) {
      if (f.required) e[f.key] = "Required.";
      continue;
    }
    const str = String(val).trim();
    if (f.type === "integer" && !/^\d+$/.test(str))
      e[f.key] = "Whole number only.";
    if (f.type === "decimal" && !/^\d+(\.\d{1,2})?$/.test(str))
      e[f.key] = "Number, up to 2 decimals.";
    if (
      f.type === "date" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(str) || isNaN(Date.parse(str)))
    )
      e[f.key] = "Use YYYY-MM-DD.";
  }
  return e;
}

export function toPayload(fields: FieldDef[], v: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    const val = v[f.key];
    const empty = val === "" || val === null || val === undefined;
    switch (f.type) {
      case "bool":
        out[f.key] = !!val;
        break;
      case "integer":
        out[f.key] = empty
          ? f.nullable
            ? null
            : 0
          : parseInt(String(val), 10);
        break;
      case "decimal":
        out[f.key] = empty ? null : String(val).trim();
        break;
      case "date":
      case "select":
        out[f.key] = empty ? null : val;
        break;
      case "file":
        out[f.key] = empty ? null : val;
        break;
      default:
        out[f.key] = String(val ?? "").trim();
    }
  }
  return out;
}

/** Maps DRF validation errors ({field: [msg]}) back onto form fields. */
export function apiErrors(e: unknown): { errors: Errors; general: string } {
  const errors: Errors = {};
  let general = "";
  if (
    e instanceof ApiError &&
    e.data &&
    typeof e.data === "object" &&
    !Array.isArray(e.data)
  ) {
    for (const [k, v] of Object.entries(e.data)) {
      const msg = Array.isArray(v) ? v.join(" ") : String(v);
      if (k === "detail" || k === "non_field_errors") general += msg + "\n";
      else errors[k] = msg;
    }
    if (!general && Object.keys(errors).length === 0) general = e.message;
  } else general = (e as Error)?.message ?? "Something went wrong.";
  return { errors, general: general.trim() };
}

function SelectInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const remote = useQuery({
    queryKey: ["admin-options", def.optionsFrom?.resource],
    enabled: !!def.optionsFrom,
    staleTime: 60_000,
    queryFn: async () =>
      (await Admin.list<any>(def.optionsFrom!.resource, { page_size: 200 }))
        .results,
  });
  const options: Option[] =
    def.options ??
    remote.data?.map((r) => ({
      value: r.id,
      label: def.optionsFrom!.label(r),
    })) ??
    [];
  const all = def.nullable
    ? [{ value: "", label: "None" }, ...options]
    : options;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {all.map((o) => (
        <View key={String(o.value)} style={{ marginBottom: 8 }}>
          <Chip
            label={o.label}
            active={(value ?? "") === o.value}
            onPress={() => onChange(o.value === "" ? null : o.value)}
          />
        </View>
      ))}
      {remote.isLoading ? (
        <Text style={{ color: colors.muted }}>Loading…</Text>
      ) : null}
    </View>
  );
}

function ImageInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: any;
  onChange: (v: any) => void;
}) {
  const allowMultiple = false;

  const [uploading, setUploading] = useState<string | null>(null);
  const [imageRes, setImageRes] = useState<string | undefined>(value);

  return (
    <TouchableOpacity
      onPress={() =>
        selectImage({
          allowMultiple,
          uriSetter: setImageRes,
          valueChangeHandler: onChange,
        })
      }
      style={{
        height: 180,
        borderRadius: 12,
        backgroundColor: "#f1f1f1",
        borderWidth: 1,
        borderColor: "#ddd",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {imageRes ? (
        <>
          <Image
            source={{ uri: imageRes }}
            style={{ width: "100%", height: "100%" }}
          />
          <Pressable
            onPress={() => {
              Alert.alert("Delete photo?", undefined, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    setImageRes(undefined);
                    onChange(null);
                  },
                },
              ]);
            }}
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
          {uploading && (
            <View
              style={{
                position: "absolute",
                backgroundColor: "rgba(0,0,0,0.4)",
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </>
      ) : (
        <Text style={{ color: "#888" }}>Tap to upload {`${def.label}`}</Text>
      )}
    </TouchableOpacity>
  );
}

export function DynamicForm({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: FieldDef[];
  values: Values;
  errors: Errors;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <>
      {fields.map((f) => {
        const err = errors[f.key];
        const label = f.required ? `${f.label} *` : f.label;
        if (f.type === "bool") {
          return (
            <View
              key={f.key}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text style={s.label}>{f.label}</Text>
              <Switch
                value={!!values[f.key]}
                onValueChange={(v) => onChange(f.key, v)}
                trackColor={{ true: colors.primary }}
              />
            </View>
          );
        }
        if (f.type === "select") {
          return (
            <View key={f.key} style={{ marginBottom: 6 }}>
              <Text style={s.label}>{label}</Text>
              <SelectInput
                def={f}
                value={values[f.key]}
                onChange={(v) => onChange(f.key, v)}
              />
              {err ? (
                <Text style={[s.err, { marginBottom: 8 }]}>{err}</Text>
              ) : null}
            </View>
          );
        }
        if (f.type === "file") {
          return (
            <View key={f.key} style={{ marginBottom: 6 }}>
              <Text style={s.label}>{label}</Text>
              <ImageInput
                def={f}
                value={values[f.key]}
                onChange={(v) => onChange(f.key, v)}
              />
              {err ? (
                <Text style={[s.err, { marginBottom: 8 }]}>{err}</Text>
              ) : null}
            </View>
          );
        }
        return (
          <Field
            key={f.key}
            label={label}
            error={err}
            value={String(values[f.key] ?? "")}
            onChangeText={(t) => onChange(f.key, t)}
            placeholder={f.help}
            autoCapitalize={
              f.type === "text" || f.type === "multiline" ? "sentences" : "none"
            }
            keyboardType={
              f.type === "integer"
                ? "number-pad"
                : f.type === "decimal"
                  ? "decimal-pad"
                  : f.type === "date"
                    ? "numbers-and-punctuation"
                    : "default"
            }
            multiline={f.type === "multiline"}
            style={
              f.type === "multiline"
                ? [s.input, { minHeight: 100, textAlignVertical: "top" }]
                : undefined
            }
          />
        );
      })}
    </>
  );
}
