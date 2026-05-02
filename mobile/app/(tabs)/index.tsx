import { useCallback, useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { apiFetch, fc, formatDate } from "../../constants/api";
import { C } from "../../constants/colors";
import { useOnline } from "../../hooks/useOfflineSync";
import {
  CachedEntry, getIncomeCache, setIncomeCache, getExpCache, setExpCache,
} from "../../utils/storage";
import OfflineBanner from "../../components/OfflineBanner";

function computeStats(income: CachedEntry[], exp: CachedEntry[]) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  return {
    incomeTotal: income.reduce((s, e) => s + Number(e.grand_total), 0),
    expTotal: exp.reduce((s, e) => s + Number(e.grand_total), 0),
    incomeMonth: income.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + Number(e.grand_total), 0),
    expMonth: exp.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + Number(e.grand_total), 0),
    incomeCount: income.length,
    expCount: exp.length,
  };
}

export default function DashboardScreen() {
  const { isOnline } = useOnline();
  const [income, setIncome] = useState<CachedEntry[]>([]);
  const [exp, setExp] = useState<CachedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = useCallback(async () => {
    const [inc, ex] = await Promise.all([getIncomeCache(), getExpCache()]);
    setIncome(inc);
    setExp(ex);
    setLoading(false);
  }, []);

  const fetchFromApi = useCallback(async () => {
    if (!isOnline) return;
    try {
      setError(null);
      const [inc, ex] = await Promise.all([
        apiFetch<CachedEntry[]>("/api/entries"),
        apiFetch<CachedEntry[]>("/api/expenditure"),
      ]);
      await Promise.all([setIncomeCache(inc), setExpCache(ex)]);
      setIncome(inc);
      setExp(ex);
    } catch (e) {
      if (income.length === 0 && exp.length === 0) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    } finally {
      setRefreshing(false);
    }
  }, [isOnline, income.length, exp.length]);

  useEffect(() => { loadFromCache(); }, [loadFromCache]);

  useFocusEffect(useCallback(() => {
    loadFromCache().then(() => fetchFromApi());
  }, [loadFromCache, fetchFromApi]));

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={C.primary} /></SafeAreaView>;
  }

  const s = computeStats(income, exp);
  const net = s.incomeTotal - s.expTotal;
  const netMonth = s.incomeMonth - s.expMonth;
  const recentIncome = income.slice(0, 5);
  const recentExp = exp.slice(0, 5);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <OfflineBanner />
      {error && (
        <View style={styles.errorBar}>
          <Text style={styles.errorBarText}>{error}</Text>
        </View>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFromApi(); }}
            tintColor={C.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>✝</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Church Account</Text>
            <Text style={styles.headerSub}>
              {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: C.income }]}>
            <Text style={styles.statLabel}>Total Income</Text>
            <Text style={styles.statAmount}>{fc(s.incomeTotal)}</Text>
            <Text style={styles.statSub}>{s.incomeCount} entries · {fc(s.incomeMonth)} this month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.exp }]}>
            <Text style={styles.statLabel}>Expenditure</Text>
            <Text style={styles.statAmount}>{fc(s.expTotal)}</Text>
            <Text style={styles.statSub}>{s.expCount} entries · {fc(s.expMonth)} this month</Text>
          </View>
        </View>
        <View style={[styles.netCard, { backgroundColor: net >= 0 ? C.primary : "#ea580c" }]}>
          <Text style={styles.statLabel}>Net Balance (Income − Expenditure)</Text>
          <Text style={styles.netAmount}>{fc(net)}</Text>
          <Text style={styles.statSub}>This month: {fc(netMonth)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: C.income }]} onPress={() => router.push("/(tabs)/income")}>
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={[styles.actionLabel, { color: C.income }]}>New Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: C.primary }]} onPress={() => router.push("/(tabs)/history")}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: C.primary }]}>Income Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: C.exp }]} onPress={() => router.push("/(tabs)/expenditure")}>
            <Text style={styles.actionIcon}>🧾</Text>
            <Text style={[styles.actionLabel, { color: C.exp }]}>New Exp.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: C.sub }]} onPress={() => router.push("/(tabs)/exp-history")}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={[styles.actionLabel, { color: C.sub }]}>Exp. Records</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Income</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
            <Text style={styles.viewAll}>View all →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {recentIncome.length === 0 ? (
            <Text style={styles.emptyText}>No income entries yet</Text>
          ) : recentIncome.map((e, i) => (
            <View key={e.id} style={[styles.listRow, i < recentIncome.length - 1 && styles.listRowBorder]}>
              <View style={styles.listLeft}>
                <Text style={styles.listDate}>{formatDate(e.date)}</Text>
                <Text style={styles.listSub}>{e.service_type}{e.pending ? "  ⏳" : ""}</Text>
              </View>
              <Text style={[styles.listAmount, { color: C.income }]}>{fc(Number(e.grand_total))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenditure</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/exp-history")}>
            <Text style={styles.viewAll}>View all →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listCard}>
          {recentExp.length === 0 ? (
            <Text style={styles.emptyText}>No expenditure entries yet</Text>
          ) : recentExp.map((e, i) => (
            <View key={e.id} style={[styles.listRow, i < recentExp.length - 1 && styles.listRowBorder]}>
              <View style={styles.listLeft}>
                <Text style={styles.listDate}>{formatDate(e.date)}</Text>
                <Text style={styles.listSub}>{e.service_type}{e.pending ? "  ⏳" : ""}</Text>
              </View>
              <Text style={[styles.listAmount, { color: C.exp }]}>{fc(Number(e.grand_total))}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
  errorBar: { backgroundColor: "#fef3c7", padding: 10, paddingHorizontal: 16 },
  errorBarText: { fontSize: 13, color: "#92400e" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  logo: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 22, color: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.text },
  headerSub: { fontSize: 13, color: C.sub, marginTop: 1 },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard: { flex: 1, borderRadius: 18, padding: 16 },
  netCard: { borderRadius: 18, padding: 16, marginBottom: 24 },
  statLabel: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  statAmount: { fontSize: 20, fontWeight: "800", color: "#fff", marginBottom: 4 },
  netAmount: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 4 },
  statSub: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  viewAll: { fontSize: 13, fontWeight: "600", color: C.primary },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  actionBtn: { width: "47%", backgroundColor: C.card, borderWidth: 1.5, borderRadius: 16, padding: 16, alignItems: "center" },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  listCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden", marginBottom: 20 },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  listLeft: { flex: 1, marginRight: 8 },
  listDate: { fontSize: 14, fontWeight: "700", color: C.text },
  listSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  listAmount: { fontSize: 15, fontWeight: "800" },
  emptyText: { textAlign: "center", padding: 20, color: C.muted, fontSize: 14 },
});
