import type { BookingStatus, Currency, TripSummary, Unit } from "../types";

export const money = (
  amount: string | number | null | undefined,
  cur: Currency | string = "KES",
) => {
  if (amount === null || amount === undefined) return "";
  const n = Number(amount);
  return `${cur === "USD" ? "USD" : "KES"} ${n.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
};

export const unitLabel: Record<Unit, string> = {
  per_person: "per person",
  per_person_sharing: "per person sharing",
  per_person_per_night: "per person / night",
};

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const fmtDate = (iso: string, withYear = true) =>
  parse(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
export const fmtRange = (start: string, end?: string | null) =>
  end && end !== start
    ? `${fmtDate(start, false)} – ${fmtDate(end)}`
    : fmtDate(start);
export const monthKey = (iso: string) =>
  parse(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

export const duration = (
  t: Pick<TripSummary, "duration_days" | "duration_nights">,
) =>
  t.duration_days <= 1 && !t.duration_nights
    ? "Day trip"
    : `${t.duration_days} days${t.duration_nights ? ` / ${t.duration_nights} nights` : ""}`;

export const statusInfo: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: { label: "Awaiting deposit", color: "#B45309" },
  deposit_paid: { label: "Seat secured", color: "#1F6F43" },
  paid: { label: "Fully paid", color: "#1F7A3E" },
  cancelled: { label: "Cancelled", color: "#B42318" },
};

export const getImageUrl = (url: string) => {
  if (!url) return null;
  if (__DEV__ && url.includes("localhost")) {
    return url.replace("http://localhost:8000", process.env.EXPO_PUBLIC_MEDIA_HOST);
  }
  return url;
};
