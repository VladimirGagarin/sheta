import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Fonts, MaxContentWidth, Palette } from '@/constants/theme';

interface ScreenShellProps {
  kicker: string;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightLabel?: string;
  children: ReactNode;
}

export function ScreenShell({
  kicker,
  title,
  subtitle,
  showBack = true,
  rightLabel = 'NODE: LOCAL',
  children,
}: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.grid}>
        {Array.from({ length: 12 }, (_, index) => (
          <View key={index} style={[styles.gridLine, { top: index * 72 }]} />
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← BACK</Text>
            </Pressable>
          ) : (
            <View style={styles.backSpacer} />
          )}
          <Text style={styles.node}>{rightLabel}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>{kicker}</Text>
          <View>
            <Text style={[styles.titleGhost, styles.title]}>{title}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {children}

        <Text style={styles.footer}>SHT://OFFLINE ENGINE · NO SERVER · NO ACCOUNT · NO TRACE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.void,
  },
  grid: {
    position: 'absolute',
    inset: 0,
    opacity: 0.16,
  },
  gridLine: {
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Palette.border,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 14,
  },
  backSpacer: {
    width: 70,
  },
  backText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    color: Palette.green,
  },
  node: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.8,
    color: Palette.muted,
  },
  titleBlock: {
    marginTop: 26,
    marginBottom: 24,
  },
  kicker: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 4,
    color: Palette.cyan,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.mono,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
    color: Palette.text,
  },
  titleGhost: {
    position: 'absolute',
    left: 2,
    top: 2,
    color: Palette.cyan,
    opacity: 0.4,
  },
  subtitle: {
    marginTop: 12,
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: Palette.muted,
    maxWidth: 500,
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.3,
    color: Palette.borderBright,
  },
});
