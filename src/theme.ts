export const palette = {
  light: {
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
    bg: "#F6F3EE",
    card: "#FFFFFF",
    muted: "#5F635D",
  },
  dark: {
    primary: "#7CCFA4",
    primaryDark: "#5AAE86",
    primarySoft: "#153327",
    accent: "#E7B15E",
    accentSoft: "#3B2B16",
    background: "#111A17",
    backgroundAlt: "#16211E",
    surface: "#1A2522",
    surfaceMuted: "#1D2B28",
    text: "#F5F7F6",
    textSoft: "#AFB7B2",
    border: "#2A3834",
    success: "#67D59E",
    successSoft: "#123528",
    danger: "#F48787",
    dangerSoft: "#3B1E1E",
    warning: "#F7C76A",
    warn: "#F7C76A",
    shadow: "rgba(0,0,0,0.35)",
    bg: "#111A17",
    card: "#1A2522",
    muted: "#AFB7B2",
  },
} as const;

export const colors: Record<string, string> = { ...palette.light };

export function applyTheme(scheme: "light" | "dark" = "light") {
  const next = scheme === "dark" ? palette.dark : palette.light;
  Object.keys(next).forEach((key) => {
    colors[key] = next[key as keyof typeof next];
  });
}

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
