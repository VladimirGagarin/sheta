import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Fonts, Palette } from '@/constants/theme';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789#$%&*<>/\\[]{}=+';

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function scramble(source: string[]): string[] {
  return source.map((character) =>
    character === ' ' || character === '\n' ? character : randomGlyph(),
  );
}

interface HackRevealTextProps {
  value: string;
  style?: StyleProp<TextStyle>;
  duration?: number;
  maxChars?: number;
}

export function HackRevealText(props: HackRevealTextProps) {
  return (
    <HackRevealTextInner
      key={`${props.duration}:${props.maxChars}:${props.value}`}
      {...props}
    />
  );
}

function HackRevealTextInner({ value, style, duration = 1100, maxChars = 1400 }: HackRevealTextProps) {
  const source = useMemo(() => Array.from(value).slice(0, maxChars), [value, maxChars]);
  const [display, setDisplay] = useState<string[]>(() => source);
  const [revealed, setRevealed] = useState(() => source.length);
  const cursor = useSharedValue(1);

  useEffect(() => {
    cursor.value = withRepeat(withTiming(0, { duration: 520, easing: Easing.linear }), -1, true);
  }, [cursor]);

  const cursorStyle = useAnimatedStyle(() => ({ opacity: cursor.value }));

  useEffect(() => {
    if (source.length === 0) {
      return;
    }

    const started = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - started) / Math.max(duration, 1));
      const count = Math.floor(progress * source.length);
      const settled = source.slice(0, count);
      setRevealed(count);
      setDisplay([...settled, ...scramble(source.slice(count))]);
      if (progress >= 1) {
        clearInterval(timer);
        setRevealed(source.length);
        setDisplay(source);
      }
    }, 42);

    return () => clearInterval(timer);
  }, [source, duration]);

  return (
    <Text style={[styles.text, style]} accessibilityLabel={value} selectable={false}>
      {display.map((character, index) => (
        <Text key={index} style={index < revealed ? styles.settled : styles.scrambling}>
          {character}
        </Text>
      ))}
      <Animated.Text style={[styles.cursor, cursorStyle]}>█</Animated.Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 21,
    color: Palette.text,
  },
  settled: {
    color: Palette.text,
  },
  scrambling: {
    color: Palette.greenDim,
    opacity: 0.65,
  },
  cursor: {
    color: Palette.green,
    fontSize: 12,
  },
});
