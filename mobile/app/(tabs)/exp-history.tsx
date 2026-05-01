import { useCallback, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { apiFetch, fc, formatDate } from "../../constants/api";
import { EXPENDITURE_CATEGORIES } from "../../constants/categories";
import { C } from "../../constants/colors";

interface Entry {
  id: number;
  date: string;
  service_type: string;
  total_church: number;
  total_project: number;
  grand_total: number;
  [key: string]: unknown;
}

export default function ExpHistoryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<Entry[]>("/api/expenditure");
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function handleDelete(id: number, date: string) {
    Alert.alert("Delete Entry", `Delete expenditure entry for ${date}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/expenditure/${id}`, { method: "DELETE" });
            setEntries(prev => prev.filter(e => e.id !== id));
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete");
          }
        },
      },
    ]);
  }

  const overallTotal = entries.reduce((s, e) => s + Number(e.grand_total), 0);

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={C.exp} /></SafeAreaView>;
  }
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: C.exp }]} onPress={load}>
          <Text style={styles.btnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        data={entries}
        keyExtractor={e => String(e.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.exp} />}
        ListHeaderComponent={
          entries.length > 0 ? (
            <View style={styles.header}>
              <View style={[styles.totalBanner, { backgroundColor: C.exp }]}>
                <Text style={styles.bannerLabel}>Overall Total Expenditure</Text>
                <Text style={styles.bannerAmt}>{"₦" + overallTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                <Text style={styles.bannerSub}>{entries.length} records</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No expenditure records yet.</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: C.exp }]} onPress={() => router.push("/(tabs)/expenditure")}>
              <Text style={styles.btnText}>Add First Entry</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: e }) => {
          const isExpanded = expanded === e.id;
          return (
            <TouchableOpacity style={styles.card} onPress={() => setExpanded(isExpanded ? null : e.id)} activeOpacity={0.8}>
              <View style={styles.cardTop}>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardDate}>{formatDate(e.date)}</Text>
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { color: C.exp }]}>{e.service_type}</Text>
                  </View>
                </View>
                <Text style={[styles.cardTotal, { color: C.exp }]}>{fc(Number(e.grand_total))}</Text>
              </View>

              {isExpanded && (
                <>
                  <View style={styles.catWrap}>
                    {EXPENDITURE_CATEGORIES.map(cat => {
                      const church = Number(e[`${cat.key}_church`]) || 0;
                      const project = Number(e[`${cat.key}_project`]) || 0;
                      if (!church && !project) return null;
                      return (
                        <View key={cat.key} style={styles.catChip}>
                          <Text style={styles.catText}>{cat.label}: {fc(church + project)}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.subTotals}>
                    <View style={styles.subTotal}>
                      <Text style={styles.subLabel}>Church</Text>
                      <Text style={styles.subAmt}>{fc(Number(e.total_church))}</Text>
                    </View>
                    <View style={styles.subTotal}>
                      <Text style={styles.subLabel}>Project</Text>
                      <Text style={styles.subAmt}>{fc(Number(e.total_project))}</Text>
                    </View>
                    <View style={[styles.subTotal, { backgroundColor: C.exp }]}>
                      <Text style={[styles.subLabel, { color: "rgba(255,255,255,0.8)" }]}>Total</Text>
                      <Text style={[styles.subAmt, { color: "#fff" }]}>{fc(Number(e.grand_total))}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: C.primary }]}
                      onPress={() => router.push(`/edit-exp/${e.id}` as never)}
                    >
                      <Text style={[styles.actionBtnText, { color: C.primary }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: C.exp }]}
                      onPress={() => handleDelete(e.id, e.date)}
                    >
                      <Text style={[styles.actionBtnText, { color: C.exp }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: C.bg },
  list: { padding: 12, paddingBottom: 32 },
  header: { marginBottom: 4 },
  totalBanner: { borderRadius: 18, padding: 18, marginBottom: 12 },
  bannerLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  bannerAmt: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 2 },
  bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 10, padding: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardMeta: { flex: 1, marginRight: 12 },
  cardDate: { fontSize: 15, fontWeight: "700", color: C.text, marginBottom: 4 },
  badge: { alignSelf: "flex-start", backgroundColor: C.expLight, borderWidth: 1, borderColor: "#fecdd3", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  cardTotal: { fontSize: 17, fontWeight: "800" },
  catWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  catChip: { backgroundColor: C.expLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  catText: { fontSize: 12, color: C.exp, fontWeight: "500" },
  subTotals: { flexDirection: "row", gap: 8, marginTop: 12 },
  subTotal: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: "center" },
  subLabel: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: 3 },
  subAmt: { fontSize: 13, fontWeight: "800", color: C.text },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  actionBtnText: { fontSize: 14, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 16, color: C.sub, marginBottom: 20 },
  btn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  errorText: { fontSize: 14, color: C.exp, textAlign: "center", marginBottom: 16 },
});
