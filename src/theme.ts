export const colors = {
  primary: "#1E6B4F",
  primaryDark: "#124F3D",
  primarySoft: "#EAF5F0",
  accent: "#E7B15E",
  accentSoft: "#FFF3DA",
  background: "#F6F3EE",
  backgroundAlt: "#F1EDE7",
  surface: "#FFFFFF",
  surfaceMuted: "#F4F1EB",
  text: "#1B1B1B",
  textSoft: "#5F635D",
  border: "#E7E1D8",
  success: "#2E8B57",
  successSoft: "#E9F8EE",
  danger: "#C84B4B",
  dangerSoft: "#FCEAEA",
  warning: "#D98C2A",
  warn: "#D98C2A",
  shadow: "rgba(18, 38, 24, 0.12)",

  // Backwards-compatible aliases for existing code
  bg: "#F6F3EE",
  card: "#FFFFFF",
  muted: "#5F635D",
};

export const radius = 20;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const categoryStyle: Record<string, { emoji: string; bg: string; accent: string }> = {
  "Day Hikes": { emoji: "🥾", bg: "#E7F3E7", accent: "#2D7A4F" },
  "Overland & Camping": { emoji: "⛺", bg: "#F6E9D8", accent: "#C78C42" },
  "Beach & Marine": { emoji: "🐬", bg: "#DFF2FB", accent: "#2A7CCB" },
  "Wildlife Safaris": { emoji: "🦒", bg: "#F8EFCF", accent: "#B2872C" },
  "Day Trips": { emoji: "🚌", bg: "#EDE6F7", accent: "#6D5ABD" },
  "Adventure & Fun": { emoji: "🏎️", bg: "#FDE3E3", accent: "#CD5C5C" },
  "Hotel Offers": { emoji: "🏨", bg: "#E0EEF7", accent: "#3E6C8C" },
};

export const styleFor = (cat: string) =>
  categoryStyle[cat] ?? { emoji: "🌍", bg: "#EFEDE7", accent: colors.primary };
