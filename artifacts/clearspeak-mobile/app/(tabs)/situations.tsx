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

const ACCENT = "#a855f7";

const COMMON_SITUATIONS = [
  {
    title: 'Someone says "We should hang out sometime"',
    explanation:
      "This usually means the person likes you and is being friendly, but they may not have a specific plan. It's often a polite way of saying they enjoy your company. You don't need to immediately set a date — you can say \"That sounds fun!\" and see if they follow up.",
  },
  {
    title: 'A teacher says "You might want to check your work"',
    explanation:
      "This almost always means your work has mistakes. Teachers often soften criticism this way. You should go back and review what you did carefully.",
  },
  {
    title: 'Someone says "Whatever" during an argument',
    explanation:
      "This usually means the person is frustrated and doesn't want to continue the conversation. It's not really about agreeing with you — they're signaling they want to stop talking about it.",
  },
  {
    title: 'A friend says "It\'s fine" but seems upset',
    explanation:
      "When someone says \"it's fine\" but their tone or body language says otherwise, they may actually be upset but not ready to talk about it. Give them some space, and you can check in later.",
  },
  {
    title: 'Someone says "I\'ll think about it"',
    explanation:
      "This could mean yes or no. Sometimes it means they genuinely need time to decide. Other times it's a polite way to say no without conflict. If it's important, it's okay to follow up once after a day or two.",
  },
];

export default function SituationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [customResult, setCustomResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function toggleExpand(i: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(expanded === i ? null : i);
  }

  async function handleCustom() {
    if (!custom.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError("");
    setCustomResult("");
    try {
      const data = await callLlm(
        `An autistic teen encountered this social situation: "${custom}"\n\nExplain clearly and simply:\n1. What is likely happening socially\n2. How the other person probably feels\n3. What would be a good response or action`
      );
      if (data.success) {
        setCustomResult(data.response);
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

  const Scroll = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollView;

  return (
    <Scroll
      style={[styles.scroll, { backgroundColor: "#faf5ff" }]}
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
          <Ionicons name="people-outline" size={24} color={ACCENT} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: ACCENT, fontFamily: "Inter_700Bold" }]}>
            Situations Library
          </Text>
          <Text style={[styles.subtitle, { color: "#6b21a8", fontFamily: "Inter_400Regular" }]}>
            Tap a situation to see a clear explanation, or describe your own
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: "#6b21a8", fontFamily: "Inter_600SemiBold" }]}>
        COMMON SITUATIONS
      </Text>

      <View style={styles.accordionList}>
        {COMMON_SITUATIONS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.accordionItem,
              {
                backgroundColor: colors.card,
                borderColor: expanded === i ? ACCENT + "60" : ACCENT + "20",
              },
            ]}
          >
            <TouchableOpacity
              testID={`situation-${i}`}
              style={styles.accordionHeader}
              onPress={() => toggleExpand(i)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.accordionTitle,
                  { color: colors.foreground, fontFamily: "Inter_500Medium" },
                ]}
              >
                {s.title}
              </Text>
              <Ionicons
                name={expanded === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={ACCENT}
              />
            </TouchableOpacity>
            {expanded === i && (
              <View style={[styles.accordionBody, { borderTopColor: ACCENT + "20" }]}>
                <Text
                  style={[
                    styles.accordionText,
                    { color: colors.foreground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {s.explanation}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={[styles.divider, { backgroundColor: ACCENT + "20" }]} />

      <Text style={[styles.sectionLabel, { color: "#6b21a8", fontFamily: "Inter_600SemiBold" }]}>
        YOUR OWN SITUATION
      </Text>
      <Text style={[styles.subLabel, { color: "#6b21a8", fontFamily: "Inter_400Regular" }]}>
        Describe something confusing that happened and get an AI explanation
      </Text>

      <TextInput
        testID="custom-situation-input"
        style={[
          styles.textarea,
          {
            backgroundColor: colors.card,
            borderColor: ACCENT + "40",
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
          },
        ]}
        value={custom}
        onChangeText={setCustom}
        placeholder="Describe a confusing social situation you experienced…"
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!loading}
      />

      <TouchableOpacity
        testID="explain-situation-button"
        style={[
          styles.button,
          { backgroundColor: ACCENT, opacity: loading || !custom.trim() ? 0.5 : 1 },
        ]}
        onPress={handleCustom}
        disabled={loading || !custom.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={[styles.buttonText, { fontFamily: "Inter_600SemiBold" }]}>
              Explain this situation
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

      {customResult ? (
        <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: ACCENT + "30" }]}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
            <Text style={[styles.resultLabel, { color: ACCENT, fontFamily: "Inter_600SemiBold" }]}>
              Explanation
            </Text>
          </View>
          <Text style={[styles.resultText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {customResult}
          </Text>
        </View>
      ) : null}
    </Scroll>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  topRow: { flexDirection: "row", gap: 14, alignItems: "flex-start", marginBottom: 24 },
  iconBadge: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  sectionLabel: { fontSize: 12, letterSpacing: 1.2, marginBottom: 10 },
  subLabel: { fontSize: 13, lineHeight: 18, marginBottom: 12, marginTop: -6 },
  accordionList: { gap: 8, marginBottom: 24 },
  accordionItem: { borderWidth: 1.5, borderRadius: 12, overflow: "hidden" },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  accordionTitle: { flex: 1, fontSize: 14, lineHeight: 20 },
  accordionBody: { paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  accordionText: { fontSize: 14, lineHeight: 22 },
  divider: { height: 1, marginBottom: 20, borderRadius: 1 },
  textarea: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
  },
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
