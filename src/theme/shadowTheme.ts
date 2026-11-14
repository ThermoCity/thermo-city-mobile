import { Platform } from "react-native";

export const shadow = (isDark: boolean) =>
  Platform.select({
    ios: {
      shadowColor: '#0B1A20',
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: isDark ? 0 : 3 },
    default: {},
  });