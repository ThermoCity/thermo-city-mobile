import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { BRAND_COLORS } from '../theme/thermoTheme';

interface ThermoLogoProps {
  variant?: 'light' | 'dark';
  showText?: boolean;
  showSlogan?: boolean;
  size?: number;
}

export default function ThermoLogo({
  variant = 'light',
  showText = true,
  showSlogan = false,
  size = 56,
}: ThermoLogoProps) {
  const isDarkBg = variant === 'dark';
  const pinStroke = isDarkBg ? BRAND_COLORS.offWhite : BRAND_COLORS.azulEscuro;
  const thermometerCutout = isDarkBg ? BRAND_COLORS.azulEscuro : BRAND_COLORS.offWhite;
  const thermoTextColor = isDarkBg ? BRAND_COLORS.offWhite : BRAND_COLORS.azulEscuro;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
        <Path
          d="M50 6 C25.7 6 6 25.7 6 50 C6 79 50 114 50 114 C50 114 94 79 94 50 C94 25.7 74.3 6 50 6 Z"
          fill="none"
          stroke={pinStroke}
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        <Circle cx="50" cy="48" r="28" fill={BRAND_COLORS.laranjaSol} />
        <Rect
          x="44.5"
          y="28"
          width="11"
          height="36"
          rx="5.5"
          fill={thermometerCutout}
        />
        <Circle cx="50" cy="67" r="9.5" fill={thermometerCutout} />
        <Rect
          x="47.5"
          y="42"
          width="5"
          height="22"
          rx="2.5"
          fill={BRAND_COLORS.laranjaSol}
        />
        <Circle cx="50" cy="67" r="6.5" fill={BRAND_COLORS.laranjaSol} />
      </Svg>

      {showText && (
        <View style={styles.wordmarkRow}>
          <Text style={[styles.thermoText, { color: thermoTextColor }]}>
            THERMO
          </Text>
          <Text style={styles.cityText}>city</Text>
        </View>
      )}

      {showSlogan && (
        <Text style={[styles.sloganText, { color: thermoTextColor }]}>
          O calor é invisível, o cuidado não
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  thermoText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cityText: {
    fontSize: 26,
    fontWeight: '300',
    color: BRAND_COLORS.laranjaSol,
  },
  sloganText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.85,
  },
});