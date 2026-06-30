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

const ACCENT = "#22c55e";

const EXAMPLE = `Friend: "Fine, whatever."
Me: "Are you sure?"
Friend: "Yes, it's fine." (but seemed upset)`;

export default function ConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [conversation, setConversation] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit() {
    if (!conversation.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = await callLlm(
        `An autistic teen is confused by this conversation or exchange:\n\n"${conversation}"\n\nPlease break it down clearly:\n1. What each person probably meant (not just what they said)\n2. What emotions or intentions were likely behind the words\n3. Any hidden social rules or expectations at play\n4. Suggested ways to respond or what to do next`
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

  function handleUseExample() {
    setConversation(EXAMPLE);
    setResult("");
    setError("");
  }

  const Scroll = Platform.OS === "web" ? ScrollView : KeyboardAwareScrollView;

  return (
    <Scroll
      style={[styles.scroll, { backgroundColor: "#f0fdf4" }]}
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
          <Ionicons name="chatbubbles-outline" size={24} color={ACCENT} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: ACCENT, fontFamily: "Inter_700Bold" }]}>
            Conversation Helper
          </Text>
          <Text style={[styles.subtitle, { color: "#14532d", fontFamily: "Inter_400Regular" }]}>
            Paste a confusing conversation and get a clear breakdown
          </Text>
        </View>
      </View>

      <Text style={[styles.label, { color: "#14532d", fontFamily: "Inter_600SemiBold" }]}>
        Paste or type the conversation
      </Text>

      <TextInput
        testID="conversation-input"
        style={[
          styles.textarea,
          {
            backgroundColor: colors.card,
            borderColor: ACCENT + "40",
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
          },
        ]}
        value={conversation}
        onChangeText={setConversation}
        placeholder={`Example:\nFriend: "Fine, whatever."\nMe: "Are you sure?"\nFriend: "Yes, it's fine." (but seemed upset)`}
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.exampleButton, { borderColor: ACCENT + "40", backgroundColor: colors.card }]}
        onPress={handleUseExample}
      >
        <Ionicons name="flash-outline" size={15} color={ACCENT} />
        <Text style={[styles.exampleButtonText, { color: ACCENT, fontFamily: "Inter_500Medium" }]}>
          Use example conversation
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="breakdown-button"
        style={[
          styles.button,
          { backgroundColor: ACCENT, opacity: loading || !conversation.trim() ? 0.5 : 1 },
        ]}
        onPress={handleSubmit}
        disabled={loading || !conversation.trim()}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="layers-outline" size={18} color="#fff" />
            <Text style={[styles.buttonText, { fontFamily: "Inter_600SemiBold" }]}>
              Break down this conversation
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
              Breakdown
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
  topRow: { flexDirection: "row", gap: 14, alignItems: "flex-start", marginBottom: 24 },
  iconBadge: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  label: { fontSize: 13, letterSpacing: 0.3, marginBottom: 8 },
  textarea: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 140,
    marginBottom: 12,
  },
  exampleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  exampleButtonText: { fontSize: 13 },
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
