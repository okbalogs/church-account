import { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiFetch, fc, isNetworkError } from "../../constants/api";
import { EXPENDITURE_CATEGORIES, SERVICE_TYPES } from "../../constants/categories";
import { C } from "../../constants/colors";
import AmountRow from "../../components/AmountRow";
import OfflineBanner from "../../components/OfflineBanner";
import { useOnline } from "../../hooks/useOfflineSync";
import { enqueue, getExpCache, setExpCache, CachedEntry } from "../../utils/storage";

type FormData = Record<string, number | string>;

function emptyForm(): FormData {
  const f: FormData = { date: new Date().toISOString().slice(0, 10), service_type: SERVICE_TYPES[0] };
  EXPENDITURE_CATEGORIES.forEach(c => { f[`${c.key}_church`] = 0; f[`${c.key}_project`] = 0; });
  return f;
}

function buildEntry(form: FormData, id: number): CachedEntry {
  const totalChurch = EXPENDITURE_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_church`]) || 0), 0);
  const totalProject = EXPENDITURE_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_project`]) || 0), 0);
  return { ...form, id, total_church: totalChurch, total_project: totalProject, grand_total: totalChurch + totalProject } as unknown as CachedEntry;
}

export default function NewExpenditureScreen() {
  const { refreshPendingCount } = useOnline();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);

  function set(key: string, val: string | number) { setForm(p => ({ ...p, [key]: val })); }

  const totalChurch = EXPENDITURE_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_church`]) || 0), 0);
  const totalProject = EXPENDITURE_CATEGORIES.reduce((s, c) => s + (Number(form[`${c.key}_project`]) || 0), 0);
  const grandTotal = totalChurch + totalProject;

  async function handleSave() {
    if (!form.date) { Alert.alert("Error", "Please enter a date"); return; }
    setSaving(true);
    const tempId = -Date.now();
    const optimistic = { ...buildEntry(form, tempId), pending: true };

    const cache = await getExpCache();
    await setExpCache([optimistic, ...cache]);

    try {
      const result = await apiFetch<CachedEntry>("/api/expenditure", { method: "POST", body: JSON.stringify(form) });
      const updated = await getExpCache();
      await setExpCache(updated.map(e => e.id === tempId ? { ...result, pending: false } : e));
      setForm(emptyForm());
      Alert.alert("Saved!", "Expenditure entry saved successfully.", [
        { text: "View Records", onPress: () => router.push("/(tabs)/exp-history") },
        { text: "New Entry", style: "cancel" },
      ]);
    } catch (e) {
      if (isNetworkError(e)) {
        await enqueue({ opId: String(Date.now()), type: "POST", path: "/api/expenditure", body: form as Record<string, unknown>, tempId });
        await refreshPendingCount();
        setForm(emptyForm());
        Alert.alert("Saved Offline", "Entry saved on your device and will sync when you're back online.", [
          { text: "View Records", onPress: () => router.push("/(tabs)/exp-history") },
          { text: "OK", style: "cancel" },
        ]);
      } else {
        const updated = await getExpCache();
        await setExpCache(updated.filter(e => e.id !== tempId));
        Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <OfflineBanner />
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Date <Text style={styles.hint}>(YYYY-MM-DD)</Text></Text>
            <TextInput style={styles.textInput} value={String(form.date)} onChangeText={v => set("date", v)}
              placeholder="2025-01-05" placeholderTextColor={C.muted} keyboardType="numbers-and-punctuation" />
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
                    <Text style={[styles.dropText, form.service_type === t && { color: C.exp, fontWeight: "700" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.colHeaders}>
          <Text style={[styles.colHead, { flex: 1.4 }]}>Category</Text>
          <Text style={[styles.colHead, { flex: 1, textAlign: "center" }]}>Church</Text>
          <Text style={[styles.colHead, { flex: 1, textAlign: "center" }]}>Project</Text>
        </View>

        {EXPENDITURE_CATEGORIES.map((cat, i) => (
          <AmountRow key={cat.key} label={cat.label}
            churchVal={Number(form[`${cat.key}_church`])} projectVal={Number(form[`${cat.key}_project`])}
            odd={i % 2 === 0} accentLight={C.expLight}
            onChurchChange={v => set(`${cat.key}_church`, v)} onProjectChange={v => set(`${cat.key}_project`, v)} />
        ))}
        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totals}>
          <View style={styles.totalItem}><Text style={styles.totalLabel}>Church</Text><Text style={styles.totalAmt}>{fc(totalChurch)}</Text></View>
          <View style={styles.totalItem}><Text style={styles.totalLabel}>Project</Text><Text style={styles.totalAmt}>{fc(totalProject)}</Text></View>
          <View style={[styles.totalItem, { backgroundColor: C.exp }]}><Text style={styles.grandLabel}>Grand Total</Text><Text style={styles.grandAmt}>{fc(grandTotal)}</Text></View>
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: C.exp }, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Entry</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  section: { backgroundColor: C.card, margin: 12, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: C.sub, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 6 },
  hint: { fontSize: 12, color: C.muted, fontWeight: "400" },
  textInput: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.text },
  picker: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "space-between" },
  pickerText: { fontSize: 16, color: C.text },
  pickerChevron: { fontSize: 12, color: C.sub },
  dropDown: { marginTop: 4, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, overflow: "hidden" },
  dropItem: { paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  dropText: { fontSize: 15, color: C.text },
  colHeaders: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border },
  colHead: { fontSize: 11, fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  footer: { backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8 },
  totals: { flexDirection: "row", gap: 8, marginBottom: 12 },
  totalItem: { flex: 1, backgroundColor: C.bg, borderRadius: 10, padding: 10, alignItems: "center" },
  totalLabel: { fontSize: 10, fontWeight: "700", color: C.muted, textTransform: "uppercase", marginBottom: 3 },
  totalAmt: { fontSize: 14, fontWeight: "800", color: C.text },
  grandLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", marginBottom: 3 },
  grandAmt: { fontSize: 14, fontWeight: "800", color: "#fff" },
  saveBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
