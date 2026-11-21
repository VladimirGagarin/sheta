import { type ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Fonts, Palette } from '@/constants/theme';

interface TerminalFrameProps {
  children: ReactNode;
  label?: string;
  style?: StyleProp<ViewStyle>;
  accent?: string;
}

export function TerminalFrame({ children, label = 'sheta://terminal', style, accent }: TerminalFrameProps) {
  const scan = useSharedValue(-8);
  const color = accent ?? Palette.greenDim;

  useEffect(() => {
    scan.value = withRepeat(withTiming(700, { duration: 4200, easing: Easing.linear }), -1, false);
  }, [scan]);

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scan.value }],
  }));

  return (
    <View style={[styles.frame, { borderColor: Palette.border }, style]}>
      <View style={[styles.topBar, { borderBottomColor: Palette.border }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <View style={[styles.dot, { backgroundColor: Palette.borderBright }]} />
          <View style={[styles.dot, { backgroundColor: Palette.border }]} />
        </View>
        <Text style={[styles.label, { color: Palette.muted }]}>{label}</Text>
        <Text style={[styles.status, { color: color }]}>LIVE</Text>
      </View>
      <View style={styles.body}>{children}</View>
      <Animated.View
        pointerEvents="none"
        style={[styles.scanline, scanStyle, { backgroundColor: color }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  status: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  body: {
    padding: 16,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    opacity: 0.12,
  },
});
