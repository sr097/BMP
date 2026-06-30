import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { callLlm } from "@/lib/api";

const ACCENT = "#3b82f6";

const EXAMPLES = [
  "It's raining cats and dogs",
  "Break a leg",
  "Hit the nail on the head",
  "That ship has sailed",
];

export default function LiteralizerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [phrase, setPhrase] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit() {
    if (!phrase.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = await callLlm(
        `A teen with autism is trying to understand this figurative phrase: "${phrase}"\n\nExplain what it LITERALLY means versus what it ACTUALLY means in plain, simple language. Format your answer clearly with two parts:\n1. What it sounds like it means (literally)\n2. What it actually means`
      );
      if (data.success) {
        setResult(data.response);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(data.response || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(ex: string) {
    setPhrase(ex);
    setResult("");
    setError("");
  }

  const Scroll = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollView;

  return (
    <Scroll
      style={[styles.scroll, { backgroundColor: "#eff6ff" }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 24,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...(Platform.OS !== "web" ? { bottomOffset: 20 } : {})}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: ACCENT + "20" }]}>
          <Ionicons name="bulb-outline" size={24} color={ACCENT} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: ACCENT, fontFamily: "Inter_700Bold" }]}>
            Literal Meaning Tool
          </Text>
          <Text style={[styles.subtitle, { color: "#1e40af", fontFamily: "Inter_400Regular" }]}>
            Enter a confusing phrase and get a plain explanation
          </Text>
        </View>
      </View>

      <Text style={[styles.label, { color: "#1e40af", fontFamily: "Inter_600SemiBold" }]}>
        Type or paste a phrase
      </Text>
      <TextInput
        testID="phrase-input"
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: ACCENT + "40",
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
          },
        ]}
        value={phrase}
        onChangeText={setPhrase}
        placeholder={"e.g. \"It's raining cats and dogs\""}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        editable={!loading}
      />

      <Text style={[styles.label, { color: "#1e40af", fontFamily: "Inter_600SemiBold" }]}>
        Try an example
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exampleRow}>
        {EXAMPLES.map((ex) => (
          <TouchableOpacity
            key={ex}
            style={[
              styles.exampleChip,
              { backgroundColor: colors.card, borderColor: ACCENT + "30" },
              phrase === ex && { backgroundColor: ACCENT + "15", borderColor: ACCENT },
            ]}
            onPress={() => handleExample(ex)}
          >
            <Text
              style={[
                styles.exampleText,
                { color: ACCENT, fontFamily: "Inter_500Medium" },
              ]}
            >
              {ex}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        testID="explain-button"
        style={[
          styles.button,
          { backgroundColor: ACCENT, opacity: loading || !phrase.trim() ? 0.5 : 1 },
        ]}
        onPress={handleSubmit}
        disabled={loading || !phrase.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="sparkles-outline" size={18} color="#fff" />
            <Text style={[styles.buttonText, { fontFamily: "Inter_600SemiBold" }]}>
              Explain this phrase
            </Text>
          </>
        )}
      </TouchableOpacity>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }]}>
          <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
          <Text style={[styles.errorText, { color: "#dc2626", fontFamily: "Inter_400Regular" }]}>
            {error}
          </Text>
        </View>
      ) : null}

      {result ? (
        <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: ACCENT + "30" }]}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
            <Text style={[styles.resultLabel, { color: ACCENT, fontFamily: "Inter_600SemiBold" }]}>
              Explanation
            </Text>
          </View>
          <Text style={[styles.resultText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {result}
          </Text>
        </View>
      ) : null}
    </Scroll>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  topRow: { flexDirection: "row", gap: 14, alignItems: "flex-start", marginBottom: 28 },
  iconBadge: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  label: { fontSize: 13, letterSpacing: 0.3, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  exampleRow: { marginBottom: 20 },
  exampleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  exampleText: { fontSize: 13 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 14, lineHeight: 20 },
  resultBox: { borderWidth: 1.5, borderRadius: 14, padding: 16, gap: 10 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultLabel: { fontSize: 14 },
  resultText: { fontSize: 15, lineHeight: 24 },
});
