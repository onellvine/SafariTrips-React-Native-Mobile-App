export type AdminResource =
  | "trips"
  | "operators"
  | "categories"
  | "payment-accounts"
  | "trip-items"
  | "pricing-options"
  | "departures";

export type Parent = { field: string; id: number };

export type RootStackParamList = {
  AdminHome: undefined;
  AdminList: { resource: AdminResource; title?: string; parent?: Parent };
  AdminForm: {
    resource: AdminResource;
    id?: number;
    parent?: Parent;
  };
  AdminTripImage: { id: number };
  AdminGallery: { tripId: number; title?: string };
  AdminTripManage: { id: number };
  Tabs: undefined;
  TripDetail: { slug: string; title?: string };
  Book: { slug: string };
  BookingDetail: { reference: string };
  Login: undefined;
  Register: undefined;
};
export type TabParamList = {
  Explore: undefined;
  Calendar: undefined;
  Bookings: undefined;
  Profile: undefined;
};
