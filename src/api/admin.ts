import { API_URL } from "../config";
import { api, tokens, describeError } from "./client";
import type { Page, TripImage } from "../types";
import * as ImagePicker from "expo-image-picker";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";
import { Alert } from "react-native";

type Params = Record<string, string | number | boolean | null | undefined>;

/**
 * Gallery contract (edit here if your backend differs):
 *   GET    /manage/trip-images/?trip=<id>   -> paginated [{ id, trip, image: <url>, caption }]
 *   POST   /manage/trip-images/             -> multipart: trip, image (file), caption?
 *   DELETE /manage/trip-images/<id>/
 */
export const GALLERY = {
  resource: "trip-images",
  fileField: "image",
  parentField: "trip",
} as const;

export const Admin = {
  list: <T>(resource: string, params: Params = {}) =>
    api<Page<T>>(`/manage/${resource}/`, {
      query: { page_size: params.page_size ?? 50, ...params },
    }),
  get: <T>(resource: string, id: number | undefined) =>
    api<T>(`/manage/${resource}/${id}/`),
  create: <T>(resource: string, body: unknown) =>
    api<T>(`/manage/${resource}/`, { method: "POST", body }),
  update: <T>(resource: string, id: number, body: unknown) => 
    api<T>(`/manage/${resource}/${id}/`, { method: "PATCH", body }),
  remove: (resource: string, id: number | undefined) =>
    api<null>(`/manage/${resource}/${id}/`, { method: "DELETE" }),

  async uploadImage(
    tripId: number | undefined,
    file: { uri: string; fileName?: string | null; mimeType?: string | null },
    caption = "",
  ) {
    const originalName =
      file.fileName ?? file.uri.split("/").pop() ?? `photo-${Date.now()}.jpg`;
    const fileName = originalName.replace(/\.heic$/i, ".jpg");

    const token = await tokens.get();
    const url = `${process.env.EXPO_PUBLIC_API_URL}/manage/${GALLERY.resource}/`;

    const form = new FormData();
    form.append(GALLERY.parentField, String(tripId));
    if (caption) form.append("caption", caption);

    // expo/fetch understands this object natively - this now works
    form.append(GALLERY.fileField, new File(file.uri), fileName);

    console.log("[UPLOAD] expo/fetch ->", url, fileName);

    const res = await fetch(url, {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT set Content-Type - expo/fetch sets boundary automatically
      },
    });

    const text = await res.text();
    console.log("[UPLOAD] status", res.status, text);

    if (!res.ok) throw new Error(text);
    return JSON.parse(text);
  },
};

/** Storage backends may return relative URLs; make them absolute against the API host. */
export const absUrl = (u: string | null) =>
  u?.startsWith("http") ? u : API_URL.replace(/\/api\/.*$/, "") + u;

export const selectImage = async ({
  allowMultiple,
  uriSetter,
  valueChangeHandler
}: {
  allowMultiple: boolean,
  uriSetter: ( uriContainer: string | undefined ) => void,
  valueChangeHandler: (value: File ) => void,
}) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Media Library Permission not granted",
      "You must allow access to media library to contunye",
    );
    return;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: allowMultiple,
    selectionLimit: 10,
    quality: 0.8,
  });
  if (res.canceled) return;

  uriSetter(res.assets[0].uri);
  valueChangeHandler(new File(res.assets[0].uri));
};

export const pickUploadImage = async ({
  allowMultiple,
  tripId,
  setProgress,
  refresh,
}: {
  allowMultiple: boolean;
  tripId: number | undefined;
  setProgress: (msg: string | null) => void;
  refresh: () => void;
}) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Media Library Permission not granted",
      "You must allow access to media library to contunye",
    );
    return;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: allowMultiple,
    selectionLimit: 10,
    quality: 0.8,
  });
  if (res.canceled) return;

  const failed: string[] = [];

  for (let i = 0; i < res.assets.length; i++) {
    console.log(res);
    setProgress(`Uploading ${i + 1} of ${res.assets.length}…`);
    try {
      await Admin.uploadImage(tripId, res.assets[i]);
    } catch (e) {
      failed.push(describeError(e));
    }
  }
  setProgress(null);
  refresh();
  if (failed.length)
    Alert.alert(`${failed.length} upload(s) failed`, failed[0]);
};
