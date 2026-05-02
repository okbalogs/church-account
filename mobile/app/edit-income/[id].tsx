import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { apiFetch, fc, isNetworkError } from "../../constants/api";
import { ACCOUNT_CATEGORIES, SERVICE_TYPES } from "../../constants/categories";
import { C } from "../../constants/colors";
import AmountRow from "../../components/AmountRow";
import { useOnline } from "../../hooks/useOfflineSync";
import { CachedEntry, enqueue, getIncomeCache, setIncomeCache } from "../../utils/storage";

type FormData = Record<string, number | string>;

export default function EditIncomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOnline, refreshPendingCount } = useOnline();
  const [form, setForm] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      const numId = Number(id);
      const cached = await getIncomeCache();
      const found = cached.find(e => e.id === numId);
      if (found) {
        setForm(found as unknown as FormData);
        return;
      }
      try {
        const data = await apiFetch<FormData>(`/api/entries/${id}`);
        setForm(data);
      } catch (e) {
        Alert.alert("Error", e instanceof Error ? e.message : "Failed to load");
        router.back();
      }
    }
    loadEntry();
  }, [id]);

  function set(key: string, val: string | number) {
    setForm(p => p ? { ...p, [key]: val } : p);
  }

  if (!form) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={C.income} /></SafeAreaView>;
  }

  const totalChurch = ACCOUNT_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_church`]) || 0), 0);
  const totalProject = ACCOUNT_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_project`]) || 0), 0);
  const grandTotal = totalChurch + totalProject;

  async function handleSave() {
    setSaving(true);
    const numId = Number(id);

    const updatedEntry: CachedEntry = {
      ...(form as unknown as CachedEntry),
      total_church: totalChurch,
      total_project: totalProject,
      grand_total: grandTotal,
    };

    const cache = await getIncomeCache();
    await setIncomeCache(cache.map(e => e.id === numId ? { ...updatedEntry, pending: numId < 0 ? true : e.pending } : e));

    if (numId < 0) {
      Alert.alert("Note", "This entry hasn't synced yet. Changes saved locally.", [{ text: "OK", onPress: () => router.back() }]);
      setSaving(false);
      return;
    }

    try {
      const result = await apiFetch<CachedEntry>(`/api/entries/${id}`, { method: "PUT", body: JSON.stringify(form) });
      const updated = await getIncomeCache();
      await setIncomeCache(updated.map(e => e.id === numId ? { ...result, pending: false } : e));
      router.back();
    } catch (e) {
      if (isNetworkError(e)) {
        await enqueue({ opId: String(Date.now()), type: "PUT", path: `/api/entries/${id}`, body: form as Record<string, unknown> });
        const updated = await getIncomeCache();
        await setIncomeCache(updated.map(e => e.id === numId ? { ...updatedEntry, pending: true } : e));
        await refreshPendingCount();
        Alert.alert("Saved Offline", "Changes saved and will sync when you're back online.", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.textInput}
              value={String(form.date ?? "")}
              onChangeText={v => set("date", v)}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Service Type</Text>
            <TouchableOpacity style={styles.picker} onPress={() => setSvcOpen(!svcOpen)}>
              <Text style={styles.pickerText}>{String(form.service_type)}</Text>
              <Text style={styles.pickerChevron}>{svcOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {svcOpen && (
              <View style={styles.dropDown}>
                {SERVICE_TYPES.map(t => (
                  <TouchableOpacity key={t} style={styles.dropItem} onPress={() => { set("service_type", t); setSvcOpen(false); }}>
                    <Text style={[styles.dropText, form.service_type === t && { color: C.income, fontWeight: "700" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {!isOnline && (
            <View style={styles.offlineNote}>
              <Text style={styles.offlineNoteText}>📵 Offline — changes will sync when connected</Text>
            </View>
          )}
        </View>

        <View style={styles.colHeaders}>
          <Text style={[styles.colHead, { flex: 1.4 }]}>Category</Text>
          <Text style={[styles.colHead, { flex: 1, textAlign: "center" }]}>Church</Text>
          <Text style={[styles.colHead, { flex: 1, textAlign: "center" }]}>Project</Text>
        </View>

        {ACCOUNT_CATEGORIES.map((cat, i) => (
          <AmountRow
            key={cat.key}
            label={cat.label}
            churchVal={Number(form[`${cat.key}_church`]) || 0}
            projectVal={Number(form[`${cat.key}_project`]) || 0}
            odd={i % 2 === 0}
            accentLight={C.incomeLight}
            onChurchChange={v => set(`${cat.key}_church`, v)}
            onProjectChange={v => set(`${cat.key}_project`, v)}
          />
        ))}

        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totals}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Church</Text>
            <Text style={styles.totalAmt}>{fc(totalChurch)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Project</Text>
            <Text style={styles.totalAmt}>{fc(totalProject)}</Text>
          </View>
          <View style={[styles.totalItem, { backgroundColor: C.income }]}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandAmt}>{fc(grandTotal)}</Text>
          </View>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: C.income }, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
  section: { backgroundColor: C.card, margin: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: C.sub, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 6 },
  textInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text },
  picker: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "space-between" },
  pickerText: { fontSize: 16, color: C.text },
  pickerChevron: { fontSize: 12, color: C.sub },
  dropDown: { marginTop: 4, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, overflow: "hidden" },
  dropItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  dropText: { fontSize: 15, color: C.text },
  offlineNote: { backgroundColor: "#fff7ed", borderRadius: 8, padding: 10 },
  offlineNoteText: { fontSize: 12, color: "#9a3412", fontWeight: "600" },
  colHeaders: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
  colHead: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  footer: { backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8 },
  totals: { flexDirection: "row", gap: 8, marginBottom: 12 },
  totalItem: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: "center" },
  totalLabel: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: 3 },
  totalAmt: { fontSize: 14, fontWeight: "800", color: C.text },
  grandLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", marginBottom: 3 },
  grandAmt: { fontSize: 14, fontWeight: "800", color: "#fff" },
  btnRow: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "700", color: C.sub },
  saveBtn: { flex: 2, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
