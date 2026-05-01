import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../../constants/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function icon(name: IoniconName, color: string) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.card,
          borderTopColor: C.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerStyle: { backgroundColor: C.card },
        headerTitleStyle: { fontWeight: "700", fontSize: 18, color: C.text },
        headerShadowVisible: false,
        headerStatusBarHeight: undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => icon("home", color),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "New Income",
          tabBarIcon: ({ color }) => icon("add-circle", color),
          tabBarActiveTintColor: C.income,
          headerTitle: "New Income Entry",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Income",
          tabBarIcon: ({ color }) => icon("list", color),
          headerTitle: "Income Records",
        }}
      />
      <Tabs.Screen
        name="expenditure"
        options={{
          title: "New Exp.",
          tabBarIcon: ({ color }) => icon("remove-circle", color),
          tabBarActiveTintColor: C.exp,
          headerTitle: "New Expenditure",
        }}
      />
      <Tabs.Screen
        name="exp-history"
        options={{
          title: "Exp. Records",
          tabBarIcon: ({ color }) => icon("stats-chart", color),
          headerTitle: "Expenditure Records",
        }}
      />
    </Tabs>
  );
}
