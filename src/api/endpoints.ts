import { api } from "./client";
import type {
  Booking,
  Category,
  Departure,
  Page,
  Payment,
  TripDetail,
  TripSummary,
  User,
} from "../types";

export interface TripFilters {
  search?: string;
  category?: string;
  ordering?: string;
  max_price?: number;
  page?: number;
}

export const Api = {
  // auth
  login: (email: string, password: string) =>
    api<{ access: string; refresh: string }>("/auth/token/", {
      method: "POST",
      body: { username: email.trim().toLowerCase(), password },
      auth: false,
    }),

  register: (b: {
    email: string;
    first_name: string;
    last_name?: string;
    password: string;
  }) =>
    api<User>("/auth/register/", {
      method: "POST",
      body: { ...b, email: b.email.trim().toLowerCase() },
      auth: false,
    }),

  me: () => api<User>("/auth/me/"),

  // catalogue
  categories: () => api<Category[]>("/categories/"),

  trips: (q: TripFilters) =>
    api<Page<TripSummary>>("/trips/", { query: { ...q } }),

  trip: (slug: string) => api<TripDetail>(`/trips/${slug}/`),
  
  departures: (page = 1) =>
    api<Page<Departure>>("/departures/", { query: { page } }),

  // bookings
  bookings: () => api<Page<Booking>>("/bookings/"),
  booking: (ref: string) => api<Booking>(`/bookings/${ref}/`),
  createBooking: (b: {
    departure: number;
    pricing_option: number;
    num_participants: number;
    contact_phone: string;
    contact_name?: string;
    notes?: string;
  }) => api<Booking>("/bookings/", { method: "POST", body: b }),
  cancelBooking: (ref: string) =>
    api<Booking>(`/bookings/${ref}/cancel/`, { method: "POST" }),
  reportPayment: (
    ref: string,
    b: { amount: string; mpesa_receipt: string; phone?: string },
  ) => api<Payment>(`/bookings/${ref}/payments/`, { method: "POST", body: b }),
};
