import React from "react";
import { Text, View } from "react-native";
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
import AdminHomeScreen from "../screens/Admin/AdminHomeScreen";
import ResourceListScreen from "../screens/Admin/ResourceListScreen";
import ResourceFormScreen from "../screens/Admin/ResourceFormScreen";
import TripManageScreen from "../screens/Admin/TripManageScreen";
import TripGalleryScreen from "../screens/Admin/TripGalleryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const icon =
  (e: string) =>
  ({ focused }: { focused: boolean }) => (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.primarySoft : "transparent",
      }}
    >
      <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.6, color: focused ? colors.primary : colors.textSoft }}>{e}</Text>
    </View>
  );

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarIcon: icon("🧭"), title: "Explore" }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarIcon: icon("📅"), title: "Calendar" }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ tabBarIcon: icon("🎟️"), title: "Bookings" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: icon("👤"), title: "Profile" }}
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
          background: colors.background,
          primary: colors.primary,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.primary,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={({ route }) => ({
            title: route.params.title ?? "Trip details",
            headerBackTitle: "Back",
          })}
        />
        <Stack.Screen name="Book" component={BookScreen} options={{ title: "Complete booking" }} />
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
          options={({ route }) => ({
            title: route.params.reference ?? "Booking",
          })}
        />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Welcome back", presentation: "modal" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Create account", presentation: "modal" }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Staff admin" }} />
        <Stack.Screen name="AdminList" component={ResourceListScreen} options={({ route }) => ({ title: route.params.title ?? "Manage" })} />
        <Stack.Screen name="AdminForm" component={ResourceFormScreen} />
        <Stack.Screen name="AdminTripManage" component={TripManageScreen} options={{ title: "Manage trip" }} />
        <Stack.Screen name="AdminGallery" component={TripGalleryScreen} options={{ title: "Gallery" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
