import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CIPHERS, type CipherDefinition, type CipherId } from '@/lib/ciphers';
import { Fonts, Palette } from '@/constants/theme';

interface CipherListProps {
  selectedId: CipherId;
  onSelect: (id: CipherId) => void;
}

function strengthColor(strength: CipherDefinition['strength']): string {
  if (strength === 'HIGH') {
    return Palette.green;
  }
  if (strength === 'MEDIUM') {
    return Palette.cyan;
  }
  return Palette.amber;
}

export function CipherList({ selectedId, onSelect }: CipherListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}>
      {CIPHERS.map((cipher) => {
        const selected = cipher.id === selectedId;
        return (
          <Pressable
            key={cipher.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(cipher.id)}
            style={[
              styles.card,
              { borderColor: selected ? Palette.green : Palette.border },
              selected && styles.cardSelected,
            ]}>
            <View style={styles.cardTop}>
              <Text style={[styles.code, { color: selected ? Palette.green : Palette.muted }]}>
                [{cipher.code}]
              </Text>
              <Text style={[styles.strength, { color: strengthColor(cipher.strength) }]}>
                {cipher.strength}
              </Text>
            </View>
            <Text style={[styles.name, { color: selected ? Palette.white : Palette.text }]}>
              {cipher.name}
            </Text>
            <Text style={styles.subtitle}>{cipher.subtitle}</Text>
            <Text style={styles.id}>{cipher.id}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingRight: 4,
    paddingBottom: 4,
  },
  card: {
    width: 190,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Palette.surface,
    padding: 14,
    gap: 6,
  },
  cardSelected: {
    backgroundColor: Palette.surfaceRaised,
    shadowColor: Palette.green,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  strength: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    letterSpacing: 1,
  },
  name: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Palette.muted,
    lineHeight: 15,
  },
  id: {
    marginTop: 4,
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: Palette.borderBright,
  },
});
