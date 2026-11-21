import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CipherList } from '@/components/cipher-list';
import { HackRevealText } from '@/components/hack-reveal-text';
import { NeonButton } from '@/components/neon-button';
import { ScreenShell } from '@/components/screen-shell';
import { TerminalFrame } from '@/components/terminal-frame';
import { Fonts, Palette } from '@/constants/theme';
import { getCipher, type CipherId } from '@/lib/ciphers';
import { errorMessage } from '@/lib/errors';
import { encryptMessage } from '@/lib/message';

export default function CipherScreen() {
  const [text, setText] = useState('');
  const [cipherId, setCipherId] = useState<CipherId>('SH-A256');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const cipher = getCipher(cipherId);

  function resetOutput() {
    setResult('');
    setError('');
    setCopied(false);
  }

  async function handleEncrypt() {
    if (!text.trim() || busy) {
      return;
    }
    setBusy(true);
    setError('');
    setResult('');
    setCopied(false);
    try {
      const payload = await encryptMessage(text, cipherId, password);
      setResult(payload);
    } catch (encryptError) {
      setError(errorMessage(encryptError));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!result) {
      return;
    }
    await Clipboard.setStringAsync(result, { android: { isSensitive: true } });
    setCopied(true);
  }

  return (
    <ScreenShell
      kicker="01 / ENCRYPT"
      title="CIPHER TEXT"
      subtitle="Write or paste a message. Pick a cipher id. Use COPY PAYLOAD, not the animated preview."
      rightLabel="MODE: SEAL">
      <TerminalFrame label="payload.input">
        <Text style={styles.label}>MESSAGE</Text>
        <TextInput
          multiline
          value={text}
          onChangeText={(value) => {
            setText(value);
            resetOutput();
          }}
          placeholder="Paste or write the text you want to hide..."
          placeholderTextColor={Palette.borderBright}
          textAlignVertical="top"
          style={styles.textArea}
        />

        <Text style={[styles.label, styles.sectionLabel]}>CIPHER METHOD</Text>
        <CipherList
          selectedId={cipherId}
          onSelect={(id) => {
            setCipherId(id);
            resetOutput();
          }}
        />

        <Text style={[styles.label, styles.sectionLabel]}>PASSWORD / OPTIONAL</Text>
        <View style={styles.passwordRow}>
          <TextInput
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              resetOutput();
            }}
            placeholder="leave empty for passwordless mode"
            placeholderTextColor={Palette.borderBright}
            style={styles.passwordInput}
          />
          <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.toggle}>
            <Text style={styles.toggleText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          Password mode wraps the cipher with AES-GCM. The password is never stored in the payload.
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            ID: <Text style={styles.metaValue}>{cipher?.id}</Text>
          </Text>
          <Text style={styles.meta}>
            LOCK:{' '}
            <Text style={[styles.metaValue, password.trim() ? styles.locked : styles.open]}>
              {password.trim() ? 'ON' : 'OFF'}
            </Text>
          </Text>
        </View>

        <View style={styles.buttonWrap}>
          <NeonButton
            label="ENCRYPT PAYLOAD"
            onPress={handleEncrypt}
            loading={busy}
            disabled={!text.trim()}
          />
        </View>
      </TerminalFrame>

      <TerminalFrame label="cipher.output" accent={Palette.cyan} style={styles.outputFrame}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>SEALED PAYLOAD</Text>
          <Text style={styles.outputCount}>{result ? `${Array.from(result).length} CHARS` : 'EMPTY'}</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {result ? (
          <>
            <HackRevealText key={result} value={result} style={styles.outputText} />
            <Text style={styles.formatNote}>
              FORMAT: payload | cipherId | pwd{'\n'}USE COPY PAYLOAD FOR AN EXACT COPY
            </Text>
            <View style={styles.copyWrap}>
              <NeonButton
                label={copied ? 'COPIED TO CLIPBOARD' : 'COPY PAYLOAD'}
                tone="secondary"
                onPress={handleCopy}
              />
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>
            &gt; waiting for plaintext...{'\n'}&gt; output will appear here after encryption_
          </Text>
        )}
      </TerminalFrame>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: Palette.green,
    marginBottom: 10,
  },
  sectionLabel: {
    marginTop: 22,
  },
  textArea: {
    minHeight: 130,
    maxHeight: 230,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    backgroundColor: Palette.void,
    padding: 14,
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 20,
    color: Palette.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    backgroundColor: Palette.void,
    paddingHorizontal: 14,
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Palette.green,
  },
  toggle: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
  },
  toggleText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Palette.muted,
  },
  hint: {
    marginTop: 10,
    fontFamily: Fonts.mono,
    fontSize: 10,
    lineHeight: 16,
    color: Palette.muted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  meta: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: Palette.muted,
  },
  metaValue: {
    color: Palette.text,
  },
  locked: {
    color: Palette.green,
  },
  open: {
    color: Palette.amber,
  },
  buttonWrap: {
    marginTop: 20,
  },
  outputFrame: {
    marginTop: 18,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  outputTitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: Palette.cyan,
  },
  outputCount: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: Palette.muted,
  },
  outputText: {
    fontSize: 12,
    color: Palette.text,
  },
  formatNote: {
    marginTop: 14,
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    color: Palette.borderBright,
  },
  copyWrap: {
    marginTop: 16,
  },
  placeholder: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 19,
    color: Palette.borderBright,
  },
  error: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    color: Palette.red,
    marginBottom: 12,
  },
});
