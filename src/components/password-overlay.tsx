import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { TerminalFrame } from '@/components/terminal-frame';
import { NeonButton } from '@/components/neon-button';
import { Fonts, Palette } from '@/constants/theme';

interface PasswordOverlayProps {
  visible: boolean;
  password: string;
  error?: string;
  onPasswordChange: (password: string) => void;
  onCancel: () => void;
  onSubmit: (password: string) => void;
}

export function PasswordOverlay({
  visible,
  password,
  error,
  onPasswordChange,
  onCancel,
  onSubmit,
}: PasswordOverlayProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.backdrop}>
        <Pressable onPress={onCancel} style={styles.dismiss} />
        <View style={styles.dialog}>
          <TerminalFrame label="security.gate" accent={Palette.amber} style={styles.frame}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>LOCKED PAYLOAD</Text>
            </View>
            <Text style={styles.heading}>PASSWORD REQUIRED</Text>
            <Text style={styles.message}>
              This message is password protected. You need to write the password the sender provided
              for you to proceed.
            </Text>
            <TextInput
              autoFocus
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="enter password"
              placeholderTextColor={Palette.borderBright}
              value={password}
              onChangeText={onPasswordChange}
              onSubmitEditing={() => onSubmit(password)}
              style={styles.input}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <NeonButton label="UNLOCK" onPress={() => onSubmit(password)} loading={false} />
              <Pressable onPress={onCancel} style={styles.cancel}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </Pressable>
            </View>
          </TerminalFrame>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(1, 4, 5, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dismiss: {
    position: 'absolute',
    inset: 0,
  },
  dialog: {
    width: '100%',
    maxWidth: 460,
    zIndex: 1,
  },
  frame: {
    borderColor: Palette.amber,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Palette.amber,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1.6,
    color: Palette.amber,
  },
  heading: {
    fontFamily: Fonts.mono,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    color: Palette.white,
    marginBottom: 12,
  },
  message: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 20,
    color: Palette.muted,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.borderBright,
    borderRadius: 8,
    backgroundColor: Palette.void,
    paddingHorizontal: 14,
    minHeight: 48,
    fontFamily: Fonts.mono,
    fontSize: 13,
    color: Palette.green,
  },
  error: {
    marginTop: 10,
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 17,
    color: Palette.red,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    color: Palette.muted,
  },
});
