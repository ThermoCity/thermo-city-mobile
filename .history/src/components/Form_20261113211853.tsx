import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '../theme/theme';

export function Field({ label, icon, error, secure, hint, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={[styles.fieldWrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {icon ? <Ionicons name={icon} size={19} color={colors.textMuted} /> : null}
        <TextInput
          {...inputProps}
          style={styles.input}
          secureTextEntry={hidden}
          placeholderTextColor="#8A9AA1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.msgRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

// variant: 'primary' (azul + texto branco) | 'accent' (laranja + texto azul) | 'outline'
export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }) {
  const v = buttonVariants[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        v.box,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        off && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={v.text.color} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.buttonText, v.text]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const buttonVariants = {
  primary: { box: { backgroundColor: colors.blue }, text: { color: '#FFFFFF' } },
  accent: { box: { backgroundColor: colors.orange }, text: { color: colors.blue } },
  outline: {
    box: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.blue },
    text: { color: colors.blue },
  },
};

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: space.lg },
  label: { fontSize: 14, fontWeight: '700', color: colors.blue, marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: space.md,
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  inputFocused: { borderColor: colors.blue },
  inputError: { borderColor: colors.error },
  input: { flex: 1, fontSize: 16, color: colors.blue, paddingVertical: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  errorText: { flex: 1, fontSize: 13, color: colors.error },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 6 },
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
