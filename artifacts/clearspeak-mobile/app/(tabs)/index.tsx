import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const TOOLS = [
  {
    id: "literalizer",
    title: "Literal Meaning Tool",
    subtitle: "What does that phrase actually mean?",
    icon: "bulb-outline" as const,
    color: "#3b82f6",
    lightBg: "#eff6ff",
    darkBg: "#1e3a5f",
    route: "/literalizer" as const,
  },
  {
    id: "situations",
    title: "Situations Library",
    subtitle: "Understand confusing social moments",
    icon: "people-outline" as const,
    color: "#a855f7",
    lightBg: "#faf5ff",
    darkBg: "#2d1b4e",
    route: "/situations" as const,
  },
  {
    id: "conversation",
    title: "Conversation Helper",
    subtitle: "Break down what people really meant",
    icon: "chatbubbles-outline" as const,
    color: "#22c55e",
    lightBg: "#f0fdf4",
    darkBg: "#052e16",
    route: "/conversation" as const,
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleTool(route: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 24,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons name="accessibility-outline" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          ClearSpeak AI
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Tools to help understand figurative language, confusing conversations,
          and unclear social moments.
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        TOOLS
      </Text>

      <View style={styles.toolsGrid}>
        {TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            colors={colors}
            onPress={() => handleTool(tool.route)}
          />
        ))}
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={20} color={colors.mutedForeground} />
        <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Each tool uses AI to give you clear, plain explanations — no sarcasm,
          no idioms, just honest answers.
        </Text>
      </View>
    </ScrollView>
  );
}

function ToolCard({
  tool,
  colors,
  onPress,
}: {
  tool: (typeof TOOLS)[0];
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={`tool-${tool.id}`}
      style={[
        styles.toolCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: tool.color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.toolIconWrap, { backgroundColor: tool.color + "18" }]}>
        <Ionicons name={tool.icon} size={28} color={tool.color} />
      </View>
      <View style={styles.toolTextWrap}>
        <Text
          style={[styles.toolTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={2}
        >
          {tool.title}
        </Text>
        <Text
          style={[styles.toolSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
          numberOfLines={2}
        >
          {tool.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 26,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  toolsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  toolIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  toolTextWrap: {
    flex: 1,
    gap: 3,
  },
  toolTitle: {
    fontSize: 16,
  },
  toolSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
});
