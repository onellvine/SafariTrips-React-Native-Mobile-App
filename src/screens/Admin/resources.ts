import type { AdminResource } from "../../navigation/types";

export interface Option {
  value: string | number;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type:
    | "text"
    | "multiline"
    | "integer"
    | "decimal"
    | "bool"
    | "date"
    | "select"
    | "file";
  required?: boolean;
  nullable?: boolean; // blank is sent as null (integers) / "None" choice (selects)
  default?: string | number | boolean | null;
  help?: string; // shown as placeholder
  options?: Option[]; // static choices
  optionsFrom?: { resource: string; label: (r: any) => string }; // choices loaded from /manage/<resource>/
}

export interface ResourceConfig {
  resource: AdminResource;
  singular: string;
  plural: string;
  fields: FieldDef[];
  title: (r: any) => string;
  subtitle?: (r: any) => string;
  search?: boolean;
}

const opts = (...pairs: [string, string][]): Option[] =>
  pairs.map(([value, label]) => ({ value, label }));

export const RESOURCES: Record<AdminResource, ResourceConfig> = {
  trips: {
    resource: "trips",
    singular: "trip",
    plural: "Trips",
    search: true,
    title: (r) => r.title,
    subtitle: (r) =>
      [
        r.operator_name,
        r.category_name,
        r.is_published ? "Published" : "Hidden",
      ]
        .filter(Boolean)
        .join(" · "),
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        optionsFrom: { resource: "operators", label: (r) => r.name },
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        optionsFrom: { resource: "categories", label: (r) => r.name },
      },
      {
        key: "trip_type",
        label: "Type",
        type: "select",
        required: true,
        default: "trip",
        options: opts(
          ["trip", "Guided trip"],
          ["accommodation", "Accommodation offer"],
        ),
      },
      {
        key: "destination",
        label: "Destination",
        type: "text",
        required: true,
      },
      { key: "summary", label: "Summary", type: "text" },
      { key: "description", label: "Description", type: "multiline" },
      { key: "cover_image", label: "Cover Photo", type: "file" },
      { key: "poster_image", label: "Poster Photo", type: "file" },
      {
        key: "duration_days",
        label: "Days",
        type: "integer",
        required: true,
        default: "1",
      },
      {
        key: "duration_nights",
        label: "Nights",
        type: "integer",
        required: true,
        default: "0",
      },
      {
        key: "transport",
        label: "Transport",
        type: "text",
        help: "Overland truck, tour van…",
      },
      {
        key: "accommodation",
        label: "Accommodation",
        type: "text",
        help: "Camping, Saltlick Lodge…",
      },
      {
        key: "min_participants",
        label: "Minimum group size",
        type: "integer",
        nullable: true,
      },
      {
        key: "perks",
        label: "Perks",
        type: "text",
        help: "Free birthday cake…",
      },
      {
        key: "covid_guidelines",
        label: "MoH COVID-19 guidelines observed",
        type: "bool",
      },
      {
        key: "deposit_type",
        label: "Deposit type",
        type: "select",
        required: true,
        default: "percent",
        options: opts(
          ["percent", "Percentage of total"],
          ["fixed", "Fixed amount per person"],
        ),
      },
      {
        key: "deposit_value",
        label: "Deposit value (% or KES)",
        type: "decimal",
        required: true,
        default: "100",
      },
      {
        key: "payment_account",
        label: "M-PESA account",
        type: "select",
        nullable: true,
        optionsFrom: {
          resource: "payment-accounts",
          label: (r) =>
            `${r.operator_name ?? `Operator ${r.operator}`}: ${r.kind === "till" ? "Till" : "Paybill"} ${r.number}`,
        },
      },
      {
        key: "payment_reference",
        label: "M-PESA account name",
        type: "text",
        help: "KIENI",
      },
      {
        key: "valid_until",
        label: "Offer valid until",
        type: "date",
        help: "YYYY-MM-DD (offers only)",
      },
      { key: "is_published", label: "Published", type: "bool", default: true },
    ],
  },
  operators: {
    resource: "operators",
    singular: "operator",
    plural: "Operators",
    title: (r) => r.name,
    subtitle: (r) => [r.phone, r.email].filter(Boolean).join(" · "),
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "whatsapp", label: "WhatsApp", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "website", label: "Website", type: "text", help: "https://…" },
      { key: "facebook", label: "Facebook", type: "text" },
      { key: "instagram", label: "Instagram", type: "text" },
      { key: "logo_url", label: "Logo URL", type: "text" },
      { key: "is_active", label: "Active", type: "bool", default: true },
    ],
  },
  categories: {
    resource: "categories",
    singular: "category",
    plural: "Categories",
    title: (r) => r.name,
    fields: [{ key: "name", label: "Name", type: "text", required: true }],
  },
  "payment-accounts": {
    resource: "payment-accounts",
    singular: "payment account",
    plural: "Payment accounts",
    title: (r) => `${r.kind === "till" ? "Till" : "Paybill"} ${r.number}`,
    subtitle: (r) => r.operator_name ?? `Operator ${r.operator}`,
    fields: [
      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        optionsFrom: { resource: "operators", label: (r) => r.name },
      },
      {
        key: "kind",
        label: "Kind",
        type: "select",
        required: true,
        default: "paybill",
        options: opts(["paybill", "Paybill"], ["till", "Till"]),
      },
      { key: "number", label: "Number", type: "text", required: true },
    ],
  },
  "pricing-options": {
    resource: "pricing-options",
    singular: "price option",
    plural: "Pricing options",
    title: (r) => r.name,
    subtitle: (r) =>
      `${r.currency} ${Number(r.amount).toLocaleString()} · ${String(r.unit).replace(/_/g, " ")}`,
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
        help: "Self-drive, Residents…",
      },
      { key: "amount", label: "Amount", type: "decimal", required: true },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        required: true,
        default: "KES",
        options: opts(["KES", "KES"], ["USD", "USD"]),
      },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        required: true,
        default: "per_person",
        options: opts(
          ["per_person", "Per person"],
          ["per_person_sharing", "Sharing"],
          ["per_person_per_night", "Per night"],
        ),
      },
      { key: "is_from_price", label: 'Show as "From …"', type: "bool" },
      { key: "notes", label: "Notes", type: "text" },
    ],
  },
  "trip-items": {
    resource: "trip-items",
    singular: "item",
    plural: "Inclusions & exclusions",
    title: (r) => r.description,
    subtitle: (r) => (r.is_included ? "✅ Included" : "❌ Not included"),
    fields: [
      {
        key: "description",
        label: "Description",
        type: "text",
        required: true,
      },
      {
        key: "is_included",
        label: "Included (off = excluded)",
        type: "bool",
        default: true,
      },
      { key: "order", label: "Order", type: "integer", default: "0" },
    ],
  },
  departures: {
    resource: "departures",
    singular: "departure",
    plural: "Departures",
    title: (r) =>
      r.end_date && r.end_date !== r.start_date
        ? `${r.start_date} → ${r.end_date}`
        : r.start_date,
    subtitle: (r) =>
      `${r.status}${r.capacity ? ` · capacity ${r.capacity}` : ""}`,
    fields: [
      {
        key: "start_date",
        label: "Start date",
        type: "date",
        required: true,
        help: "YYYY-MM-DD",
      },
      { key: "end_date", label: "End date", type: "date", help: "YYYY-MM-DD" },
      {
        key: "capacity",
        label: "Capacity (blank = unlimited)",
        type: "integer",
        nullable: true,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        default: "open",
        options: opts(
          ["open", "Open"],
          ["confirmed", "Confirmed"],
          ["full", "Full"],
          ["cancelled", "Cancelled"],
          ["completed", "Completed"],
        ),
      },
    ],
  },
};
