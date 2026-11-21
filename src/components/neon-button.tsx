import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: 'primary' | 'secondary' | 'danger';
}

export function NeonButton({ label, onPress, disabled, loading, tone = 'primary' }: NeonButtonProps) {
  const toneStyle = tone === 'danger' ? styles.danger : tone === 'secondary' ? styles.secondary : styles.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        toneStyle,
        disabled && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}>
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={Palette.void} size="small" /> : null}
        <Text
          style={[
            styles.label,
            tone === 'secondary' && styles.labelSecondary,
            (disabled || loading) && styles.labelDisabled,
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primary: {
    backgroundColor: Palette.green,
    borderColor: Palette.green,
    shadowColor: Palette.green,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: Palette.borderBright,
  },
  danger: {
    backgroundColor: Palette.red,
    borderColor: Palette.red,
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: Palette.void,
  },
  labelSecondary: {
    color: Palette.green,
  },
  labelDisabled: {
    color: Palette.muted,
  },
});
