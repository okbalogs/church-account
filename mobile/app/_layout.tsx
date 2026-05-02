import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { OnlineContext, useOfflineSyncState } from "../hooks/useOfflineSync";

function RootContent() {
  const syncState = useOfflineSyncState();
  return (
    <OnlineContext.Provider value={syncState}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="edit-income/[id]"
          options={{ title: "Edit Income Entry", headerBackTitle: "Back", headerTintColor: "#4f46e5" }}
        />
        <Stack.Screen
          name="edit-exp/[id]"
          options={{ title: "Edit Expenditure", headerBackTitle: "Back", headerTintColor: "#e11d48" }}
        />
      </Stack>
    </OnlineContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <RootContent />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
