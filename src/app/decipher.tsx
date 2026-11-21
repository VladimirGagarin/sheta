import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { HackRevealText } from '@/components/hack-reveal-text';
import { NeonButton } from '@/components/neon-button';
import { PasswordOverlay } from '@/components/password-overlay';
import { ScreenShell } from '@/components/screen-shell';
import { TerminalFrame } from '@/components/terminal-frame';
import { Fonts, Palette } from '@/constants/theme';
import type { CipherDefinition } from '@/lib/ciphers';
import { errorMessage } from '@/lib/errors';
import { decryptMessage, inspectMessage, type MessageInfo } from '@/lib/message';

export default function DecipherScreen() {
  const [payload, setPayload] = useState('');
  const [info, setInfo] = useState<MessageInfo | null>(null);
  const [decodedCipher, setDecodedCipher] = useState<CipherDefinition | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayError, setOverlayError] = useState('');
  const [copied, setCopied] = useState(false);
  const [secret, setSecret] = useState('');

  function resetOutput() {
    setInfo(null);
    setDecodedCipher(null);
    setResult('');
    setError('');
    setOverlayError('');
    setCopied(false);
    setSecret('');
  }

  async function runDecrypt(value: string, password: string) {
    setBusy(true);
    setError('');
    setOverlayError('');
    try {
      const decoded = await decryptMessage(value, password);
      setResult(decoded.text);
      setDecodedCipher(decoded.cipher);
      setOverlayVisible(false);
      setCopied(false);
      setSecret('');
    } catch (decryptError) {
      const message = errorMessage(decryptError);
      if (overlayVisible) {
        setOverlayError(message);
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalyze() {
    if (!payload.trim() || busy) {
      return;
    }
    setBusy(true);
    resetOutput();
    try {
      const parsed = inspectMessage(payload);
      setInfo(parsed);
      setDecodedCipher(parsed.cipher);
      if (parsed.passwordProtected) {
        setOverlayVisible(true);
      } else {
        await runDecrypt(payload, '');
      }
    } catch (analyzeError) {
      setError(errorMessage(analyzeError));
    } finally {
      setBusy(false);
    }
  }

  async function handlePaste() {
    const value = await Clipboard.getStringAsync();
    if (value) {
      setPayload(value);
      resetOutput();
    }
  }

  async function handleUnlock(password: string) {
    if (!password.trim()) {
      setOverlayError('Type the password the sender gave you.');
      return;
    }
    await runDecrypt(payload, password);
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
      kicker="02 / DECRYPT"
      title="DECIPHER TEXT"
      subtitle="Paste a Sheta payload. The cipher id is detected automatically from the message header."
      rightLabel="MODE: REVEAL">
      <TerminalFrame label="payload.incoming">
        <Text style={styles.label}>SHETA PAYLOAD</Text>
        <TextInput
          multiline
          value={payload}
          onChangeText={(value) => {
            setPayload(value);
            resetOutput();
          }}
          placeholder="payload|cipherId|pwd"
          placeholderTextColor={Palette.borderBright}
          textAlignVertical="top"
          style={styles.textArea}
        />

        <View style={styles.buttonRow}>
          <NeonButton label="DECIPHER PAYLOAD" onPress={handleAnalyze} loading={busy} disabled={!payload.trim()} />
          <NeonButton label="PASTE" tone="secondary" onPress={handlePaste} disabled={busy} />
        </View>
      </TerminalFrame>

      <TerminalFrame label="header.scan" accent={Palette.cyan} style={styles.scanFrame}>
        <View style={styles.scanHeader}>
          <Text style={styles.scanTitle}>HEADER SCAN</Text>
          <Text style={[styles.scanState, info ? styles.scanStateReady : null]}>
            {info ? 'IDENTIFIED' : 'WAITING'}
          </Text>
        </View>
        {info ? (
          <View style={styles.scanGrid}>
            <View style={styles.scanItem}>
              <Text style={styles.scanLabel}>CIPHER ID</Text>
              <Text style={styles.scanValue}>{info.cipher.id}</Text>
            </View>
            <View style={styles.scanItem}>
              <Text style={styles.scanLabel}>METHOD</Text>
              <Text style={styles.scanValue}>{info.cipher.name}</Text>
            </View>
            <View style={styles.scanItem}>
              <Text style={styles.scanLabel}>PASSWORD</Text>
              <Text style={[styles.scanValue, info.passwordProtected ? styles.locked : styles.open]}>
                {info.passwordProtected ? 'REQUIRED' : 'NOT SET'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholder}>&gt; no header decoded yet_</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </TerminalFrame>

      <TerminalFrame label="plaintext.output" style={styles.outputFrame}>
        <View style={styles.outputHeader}>
          <Text style={styles.outputTitle}>REVEALED MESSAGE</Text>
          <Text style={styles.outputCount}>{decodedCipher ? decodedCipher.code : '----'}</Text>
        </View>
        {result ? (
          <>
            <HackRevealText key={result} value={result} duration={1300} style={styles.outputText} />
            <View style={styles.copyWrap}>
              <NeonButton
                label={copied ? 'COPIED TO CLIPBOARD' : 'COPY MESSAGE'}
                tone="secondary"
                onPress={handleCopy}
              />
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>
            &gt; awaiting payload...{'\n'}&gt; decrypted text will materialize here_
          </Text>
        )}
      </TerminalFrame>

      <PasswordOverlay
        visible={overlayVisible}
        password={secret}
        error={overlayError}
        onPasswordChange={setSecret}
        onCancel={() => {
          setOverlayVisible(false);
          setOverlayError('');
          setSecret('');
        }}
        onSubmit={handleUnlock}
      />
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
  textArea: {
    minHeight: 120,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 10,
    backgroundColor: Palette.void,
    padding: 14,
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 19,
    color: Palette.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  scanFrame: {
    marginTop: 18,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  scanTitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 2,
    color: Palette.cyan,
  },
  scanState: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: Palette.muted,
  },
  scanStateReady: {
    color: Palette.green,
  },
  scanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  scanItem: {
    minWidth: 120,
    gap: 5,
  },
  scanLabel: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: Palette.borderBright,
  },
  scanValue: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Palette.text,
  },
  locked: {
    color: Palette.amber,
  },
  open: {
    color: Palette.greenDim,
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
    color: Palette.green,
  },
  outputCount: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: Palette.muted,
  },
  outputText: {
    fontSize: 14,
  },
  copyWrap: {
    marginTop: 18,
  },
  placeholder: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 19,
    color: Palette.borderBright,
  },
  error: {
    marginTop: 14,
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 18,
    color: Palette.red,
  },
});
