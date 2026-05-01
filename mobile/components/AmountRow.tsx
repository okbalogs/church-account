import { View, Text, TextInput, StyleSheet } from "react-native";
import { C } from "../constants/colors";

interface Props {
  label: string;
  churchVal: number;
  projectVal: number;
  odd: boolean;
  accentLight: string;
  onChurchChange: (v: number) => void;
  onProjectChange: (v: number) => void;
}

export default function AmountRow({
  label, churchVal, projectVal, odd, accentLight,
  onChurchChange, onProjectChange,
}: Props) {
  return (
    <View style={[styles.row, { backgroundColor: odd ? accentLight : C.card }]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputs}>
        <View style={styles.inputWrap}>
          <Text style={styles.prefix}>₦</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.muted}
            value={churchVal > 0 ? String(churchVal) : ""}
            onChangeText={(t) => onChurchChange(t === "" ? 0 : parseFloat(t) || 0)}
            selectTextOnFocus
          />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.prefix}>₦</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.muted}
            value={projectVal > 0 ? String(projectVal) : ""}
            onChangeText={(t) => onProjectChange(t === "" ? 0 : parseFloat(t) || 0)}
            selectTextOnFocus
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    marginBottom: 8,
  },
  inputs: {
    flexDirection: "row",
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  prefix: {
    fontSize: 15,
    color: C.muted,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: C.text,
    paddingVertical: 10,
  },
});
