import { Platform } from "react-native";

// Android emulator reaches the host machine at 10.0.2.2; iOS simulator uses localhost.
// On a physical device set EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:8000/api/v1
const fallback =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000/api/v1"
    : "http://localhost:8000/api/v1";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fallback).replace(
  /\/$/,
  "",
);
