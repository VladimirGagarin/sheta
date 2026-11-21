import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HackRevealText } from '@/components/hack-reveal-text';
import { ScreenShell } from '@/components/screen-shell';
import { TerminalFrame } from '@/components/terminal-frame';
import { Fonts, Palette } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ScreenShell
      kicker="ANCIENT WORD / MODERN CIPHER"
      title="SHETA"
      subtitle="Hide what you mean. Reveal it only to the one who holds the key."
      showBack={false}
      rightLabel="STATUS: ARMED">
      <TerminalFrame label="sheta://boot-sequence" accent={Palette.green}>
        <Text style={styles.bootLine}>
          <Text style={styles.prompt}>&gt; </Text>
          initializing local cipher engine...
        </Text>
        <Text style={styles.bootLine}>
          <Text style={styles.prompt}>&gt; </Text>
          backend: <Text style={styles.ok}>none</Text> / network: <Text style={styles.ok}>offline</Text>
        </Text>
        <Text style={styles.bootLine}>
          <Text style={styles.prompt}>&gt; </Text>
          protocol ready. awaiting instruction_
        </Text>
        <View style={styles.hero}>
          <HackRevealText value="SECRETS STAY LOCAL" duration={1400} style={styles.heroText} />
        </View>
      </TerminalFrame>

      <View style={styles.actions}>
        <Link href="/cipher" asChild>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <View style={styles.actionTop}>
              <Text style={styles.actionCode}>01 / ENCRYPT</Text>
              <Text style={styles.actionArrow}>→</Text>
            </View>
            <Text style={styles.actionTitle}>CIPHER TEXT</Text>
            <Text style={styles.actionBody}>
              Paste or write a message, choose a cipher id, and seal it with an optional password.
            </Text>
            <View style={styles.actionStrip} />
          </Pressable>
        </Link>

        <Link href="/decipher" asChild>
          <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.actionPressed]}>
            <View style={styles.actionTop}>
              <Text style={[styles.actionCode, { color: Palette.cyan }]}>02 / DECRYPT</Text>
              <Text style={[styles.actionArrow, { color: Palette.cyan }]}>→</Text>
            </View>
            <Text style={styles.actionTitle}>DECIPHER TEXT</Text>
            <Text style={styles.actionBody}>
              Drop a Sheta payload. The cipher id is read automatically and protected messages ask
              for the sender&apos;s password.
            </Text>
            <View style={[styles.actionStrip, { backgroundColor: Palette.cyan }]} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.footerStrip}>
        <Text style={styles.footerItem}>JS ALGORITHMS</Text>
        <Text style={styles.footerDivider}>/</Text>
        <Text style={styles.footerItem}>UNIQUE CIPHER IDS</Text>
        <Text style={styles.footerDivider}>/</Text>
        <Text style={styles.footerItem}>PASSWORD GATE</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  bootLine: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 20,
    color: Palette.muted,
  },
  prompt: {
    color: Palette.green,
  },
  ok: {
    color: Palette.cyan,
  },
  hero: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  heroText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
    color: Palette.green,
  },
  actions: {
    marginTop: 18,
    gap: 14,
  },
  actionCard: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    padding: 20,
    overflow: 'hidden',
  },
  actionPressed: {
    borderColor: Palette.green,
    backgroundColor: Palette.surfaceRaised,
  },
  actionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCode: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: Palette.green,
  },
  actionArrow: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    color: Palette.green,
  },
  actionTitle: {
    marginTop: 14,
    fontFamily: Fonts.mono,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
    color: Palette.white,
  },
  actionBody: {
    marginTop: 8,
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    color: Palette.muted,
  },
  actionStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Palette.green,
  },
  footerStrip: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  footerItem: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: Palette.borderBright,
  },
  footerDivider: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Palette.greenDim,
  },
});
