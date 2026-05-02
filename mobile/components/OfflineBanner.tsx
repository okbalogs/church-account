import { View, Text, StyleSheet } from "react-native";
import { useOnline } from "../hooks/useOfflineSync";

export default function OfflineBanner() {
  const { isOnline, isSyncing, pendingCount } = useOnline();

  if (isOnline && pendingCount === 0) return null;

  if (isSyncing) {
    return (
      <View style={[styles.banner, styles.syncing]}>
        <Text style={styles.text}>🔄  Syncing {pendingCount} pending {pendingCount === 1 ? "entry" : "entries"}…</Text>
      </View>
    );
  }

  if (!isOnline && pendingCount > 0) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <Text style={styles.text}>📵  Offline — {pendingCount} {pendingCount === 1 ? "entry" : "entries"} will sync when connected</Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <Text style={styles.text}>📵  You&apos;re offline — showing saved data</Text>
      </View>
    );
  }

  if (pendingCount > 0) {
    return (
      <View style={[styles.banner, styles.pending]}>
        <Text style={styles.text}>⏳  {pendingCount} {pendingCount === 1 ? "entry" : "entries"} pending sync</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 16, paddingVertical: 8 },
  offline: { backgroundColor: "#ea580c" },
  syncing: { backgroundColor: "#4f46e5" },
  pending: { backgroundColor: "#d97706" },
  text: { color: "#fff", fontSize: 13, fontWeight: "600", textAlign: "center" },
});
