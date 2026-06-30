import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

type Palette = typeof colors.light;

export function useColors(): Palette & { radius: number } {
  const scheme = useColorScheme();
  const { light, dark, radius } = colors;
  const palette: Palette = scheme === "dark" && dark ? dark : light;
  return { ...palette, radius };
}
