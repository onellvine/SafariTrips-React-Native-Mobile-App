export const colors = {
  primary: "#1F6F43",
  primaryDark: "#154D2F",
  accent: "#D97706",
  bg: "#F6F5F1",
  card: "#FFFFFF",
  text: "#1C1C1A",
  muted: "#6B6B66",
  border: "#E3E1DA",
  danger: "#B42318",
  success: "#1F7A3E",
  warn: "#B45309",
};
export const radius = 14;
export const categoryStyle: Record<string, { emoji: string; bg: string }> = {
  "Day Hikes": { emoji: "🥾", bg: "#DCEFD9" },
  "Overland & Camping": { emoji: "⛺", bg: "#F5E1C8" },
  "Beach & Marine": { emoji: "🐬", bg: "#D3EAF5" },
  "Wildlife Safaris": { emoji: "🦒", bg: "#F3E6B8" },
  "Day Trips": { emoji: "🚌", bg: "#E4DDF3" },
  "Adventure & Fun": { emoji: "🏎️", bg: "#F5D5D5" },
  "Hotel Offers": { emoji: "🏨", bg: "#D6E4F0" },
};
export const styleFor = (cat: string) =>
  categoryStyle[cat] ?? { emoji: "🌍", bg: "#E8E8E3" };
