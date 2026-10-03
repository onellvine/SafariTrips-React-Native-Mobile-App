import React from "react";
import { Text } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../theme";
import { RootStackParamList, TabParamList } from "./types";
import ExploreScreen from "../screens/ExploreScreen";
import CalendarScreen from "../screens/CalendarScreen";
import BookingsScreen from "../screens/BookingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import BookScreen from "../screens/BookScreen";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import { LoginScreen, RegisterScreen } from "../screens/AuthScreens";
import AdminHomeScreen from '../screens/Admin/AdminHomeScreen';
import ResourceListScreen from "../screens/Admin/ResourceListScreen";
import ResourceFormScreen from "../screens/Admin/ResourceFormScreen";
import TripManageScreen from "../screens/Admin/TripManageScreen";
import TripGalleryScreen from "../screens/Admin/TripGalleryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const icon =
  (e: string) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{e}</Text>
  );

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarIcon: icon("🧭"), title: "Explore" }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarIcon: icon("📅"), title: "Departures" }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarIcon: icon("🎟️"), title: "My Bookings" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: icon("👤") }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bg,
          primary: colors.primary,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerTintColor: colors.primary }}>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={({ route }) => ({ title: route.params.title ?? "Trip" })}
        />
        <Stack.Screen
          name="Book"
          component={BookScreen}
          options={{ title: "Book this trip" }}
        />
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
          options={({ route }) => ({ title: route.params.reference })}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Sign in", presentation: "modal" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Create account", presentation: "modal" }}
        />
        <Stack.Screen
          name="AdminHome"
          component={AdminHomeScreen}
          options={{ title: 'Staff admin' }}
        />
        <Stack.Screen
          name="AdminList"
          component={ResourceListScreen}
          options={({ route }) => ({ title: route.params.title ?? 'Manage' })}
        />
        <Stack.Screen
          name="AdminForm"
          component={ResourceFormScreen}
        />
        <Stack.Screen
          name="AdminTripManage"
          component={TripManageScreen}
          options={{ title: 'Manage trip' }}
        />
        <Stack.Screen
          name="AdminGallery"
          component={TripGalleryScreen}
          options={{ title: 'Gallery' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
