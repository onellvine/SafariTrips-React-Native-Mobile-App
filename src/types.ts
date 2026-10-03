export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Unit = "per_person" | "per_person_sharing" | "per_person_per_night";
export type Currency = "KES" | "USD";

export interface TripSummary {
  id: number;
  slug: string;
  title: string;
  destination: string;
  summary: string;
  trip_type: "trip" | "accommodation";
  operator: string;
  category: string;
  duration_days: number;
  duration_nights: number;
  cover_image: string;
  from_price: string | null;
  next_departure: string | null;
  valid_until: string | null;
  is_expired: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface PricingOption {
  id: number;
  name: string;
  amount: string;
  currency: Currency;
  unit: Unit;
  is_from_price: boolean;
  notes: string;
}

export interface Departure {
  id: number;
  trip_slug: string;
  trip_title: string;
  start_date: string;
  end_date: string | null;
  status: "open" | "confirmed" | "full" | "cancelled" | "completed";
  capacity: number | null;
  seats_left: number | null;
  is_bookable: boolean;
}

export interface Operator {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
}

export interface TripImage {
  id: number;
  trip?: number;
  order: number;
  caption: string | null;
  alt_text: string | null;
  image: string | null;
  image_url: string | undefined;
  is_published: boolean;
}

export interface TripDetail extends Omit<
  TripSummary,
  "operator" | "category" | "from_price" | "next_departure"
> {
  description: string;
  operator: Operator;
  category: Category;
  transport: string;
  accommodation: string;
  min_participants: number | null;
  perks: string;
  covid_guidelines: boolean;
  poster_url: string;
  pricing_options: PricingOption[];
  inclusions: string[];
  exclusions: string[];
  upcoming_departures: Departure[];
  gallery_images: TripImage[];
  deposit: { type: "percent" | "fixed"; value: string };
  payment: {
    kind: "paybill" | "till";
    number: string;
    account_name: string;
    operator: string;
  } | null;
}

export type PaymentStatus = "pending" | "verified" | "rejected";
export interface Payment {
  id: number;
  booking: number;
  amount: string;
  mpesa_receipt: string;
  phone: string;
  status: PaymentStatus;
  verified_at: string | null;
  created_at: string;
}

export type BookingStatus = "pending" | "deposit_paid" | "paid" | "cancelled";
export interface Booking {
  id: number;
  reference: string;
  departure: number;
  pricing_option: number;
  num_participants: number;
  trip: string;
  start_date: string;
  unit_price: string;
  currency: Currency;
  total_amount: string;
  deposit_amount: string;
  paid_amount: string;
  balance: string;
  status: BookingStatus;
  contact_name: string;
  contact_phone: string;
  notes: string;
  created_at: string;
  payment_instructions: {
    kind: string;
    number: string;
    account_name: string;
    deposit_due: string;
    text: string;
  } | null;
  payments: Payment[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}
