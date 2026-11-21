import {
  base64UrlToBytes,
  bytesToBase64Url,
  bytesToUtf8,
  utf8ToBytes,
} from './binary';

export type CipherId =
  | 'SH-A256'
  | 'SH-V001'
  | 'SH-X001'
  | 'SH-C007'
  | 'SH-R003'
  | 'SH-H001'
  | 'SH-T002'
  | 'SH-B003'
  | 'SH-M004'
  | 'SH-K005';

export interface CipherDefinition {
  id: CipherId;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const CIPHERS: CipherDefinition[] = [
  {
    id: 'SH-A256',
    code: 'A256',
    name: 'AES-GCM 256',
    subtitle: 'Authenticated encryption',
    description: 'Strongest mode. Password derives the key; passwordless keys travel inside the payload.',
    strength: 'HIGH',
  },
  {
    id: 'SH-V001',
    code: 'V001',
    name: 'Vigenere Shift',
    subtitle: 'Classic polyalphabetic',
    description: 'Letter shifting driven by a key. Password becomes the alphabet key.',
    strength: 'MEDIUM',
  },
  {
    id: 'SH-X001',
    code: 'X001',
    name: 'XOR Stream',
    subtitle: 'Byte-by-byte masking',
    description: 'Repeating-key XOR over UTF-8 bytes. Fast and compact.',
    strength: 'MEDIUM',
  },
  {
    id: 'SH-C007',
    code: 'C007',
    name: 'Caesar 7',
    subtitle: 'Single alphabet shift',
    description: 'Fixed seven-letter shift. Educational obfuscation, not real secrecy.',
    strength: 'LOW',
  },
  {
    id: 'SH-R003',
    code: 'R003',
    name: 'Rail Fence 3',
    subtitle: 'Three-rail transposition',
    description: 'Characters are woven across three rails and read back in order.',
    strength: 'LOW',
  },
  {
    id: 'SH-H001',
    code: 'H001',
    name: 'Hieroglyph Glyphs',
    subtitle: 'Ancient symbol substitution',
    description: 'Letters become carved glyphs. Visual obfuscation, not real secrecy.',
    strength: 'LOW',
  },
  {
    id: 'SH-T002',
    code: 'T002',
    name: 'Tap Matrix',
    subtitle: 'Dot-pair grid encoding',
    description: 'Each character is tapped as a row and column in an eight-by-eight grid.',
    strength: 'MEDIUM',
  },
  {
    id: 'SH-B003',
    code: 'B003',
    name: 'Bacon Bits',
    subtitle: 'Six-bit binary banner',
    description: 'UTF-8 bytes become blocks of filled and empty Baconian cells.',
    strength: 'MEDIUM',
  },
  {
    id: 'SH-M004',
    code: 'M004',
    name: 'Morse Signal',
    subtitle: 'Dot and dash stream',
    description: 'Bytes are transmitted as Morse-style dot and dash groups.',
    strength: 'MEDIUM',
  },
  {
    id: 'SH-K005',
    code: 'K005',
    name: 'Keyed Columns',
    subtitle: 'Password-driven grid',
    description: 'Text is written into a grid and read in password-ordered columns.',
    strength: 'MEDIUM',
  },
];

export function getCipher(id: string): CipherDefinition | undefined {
  return CIPHERS.find((cipher) => cipher.id === id);
}

function shiftCharacter(character: string, shift: number): string {
  const code = character.charCodeAt(0);
  const base = code >= 97 && code <= 122 ? 97 : code >= 65 && code <= 90 ? 65 : -1;
  if (base < 0) {
    return character;
  }
  const shifted = (((code - base + shift) % 26) + 26) % 26;
  return String.fromCharCode(base + shifted);
}

function caesar(text: string, reverse: boolean): string {
  const shift = reverse ? -7 : 7;
  return Array.from(text, (character) => shiftCharacter(character, shift)).join('');
}

function letterKey(key: string): string {
  const letters = Array.from(key.toLowerCase()).filter((character) => character >= 'a' && character <= 'z');
  return letters.length > 0 ? letters.join('') : 'sheta';
}

function vigenere(text: string, key: string, reverse: boolean): string {
  const letters = letterKey(key);
  let cursor = 0;
  return Array.from(text, (character) => {
    const lower = character.charCodeAt(0);
    const base = lower >= 97 && lower <= 122 ? 97 : lower >= 65 && lower <= 90 ? 65 : -1;
    if (base < 0) {
      return character;
    }
    const keyShift = letters.charCodeAt(cursor % letters.length) - 97;
    cursor += 1;
    return shiftCharacter(character, reverse ? -keyShift : keyShift);
  }).join('');
}

function xorBytes(input: Uint8Array, key: Uint8Array): Uint8Array {
  if (key.length === 0) {
    return input;
  }
  const output = new Uint8Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    output[index] = input[index] ^ key[index % key.length];
  }
  return output;
}

function railFence(text: string, rails: number, reverse: boolean): string {
  const characters = Array.from(text);
  if (rails < 2 || characters.length === 0) {
    return text;
  }

  if (!reverse) {
    const rows: string[][] = Array.from({ length: rails }, () => []);
    let rail = 0;
    let direction = 1;
    for (const character of characters) {
      rows[rail].push(character);
      if (rail === rails - 1) {
        direction = -1;
      } else if (rail === 0) {
        direction = 1;
      }
      rail += direction;
    }
    return rows.flat().join('');
  }

  const pattern: number[] = [];
  let rail = 0;
  let direction = 1;
  for (let index = 0; index < characters.length; index += 1) {
    pattern.push(rail);
    if (rail === rails - 1) {
      direction = -1;
    } else if (rail === 0) {
      direction = 1;
    }
    rail += direction;
  }

  const counts = Array.from({ length: rails }, () => 0);
  for (const value of pattern) {
    counts[value] += 1;
  }

  const rows: string[][] = [];
  let cursor = 0;
  for (const count of counts) {
    rows.push(characters.slice(cursor, cursor + count));
    cursor += count;
  }

  const positions = Array.from({ length: rails }, () => 0);
  const output: string[] = [];
  for (const value of pattern) {
    output.push(rows[value][positions[value]] ?? '');
    positions[value] += 1;
  }
  return output.join('');
}

const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const HIERO_UPPER = Array.from({ length: 26 }, (_, index) => String.fromCodePoint(0x13000 + index));
const HIERO_LOWER = Array.from({ length: 26 }, (_, index) => String.fromCodePoint(0x13020 + index));
const HIERO_SPACE = String.fromCodePoint(0x13040);
const HIERO_DECODE = new Map<string, string>([
  ...HIERO_UPPER.map((glyph, index) => [glyph, String.fromCharCode(65 + index)] as [string, string]),
  ...HIERO_LOWER.map((glyph, index) => [glyph, String.fromCharCode(97 + index)] as [string, string]),
  [HIERO_SPACE, ' '],
]);

const MORSE_CODES = (() => {
  const codes: string[] = [];
  for (let length = 1; codes.length < BASE64URL_ALPHABET.length; length += 1) {
    for (let value = 0; value < 2 ** length && codes.length < BASE64URL_ALPHABET.length; value += 1) {
      let code = '';
      for (let bit = length - 1; bit >= 0; bit -= 1) {
        code += ((value >> bit) & 1) === 1 ? '−' : '·';
      }
      codes.push(code);
    }
  }
  return codes;
})();
const MORSE_DECODE = new Map<string, string>(
  MORSE_CODES.map((code, index) => [code, BASE64URL_ALPHABET[index]] as [string, string]),
);

function hieroglyph(text: string, reverse: boolean): string {
  return Array.from(text, (character) => {
    if (character === '\n') {
      return character;
    }
    if (reverse) {
      return HIERO_DECODE.get(character) ?? character;
    }
    if (character === ' ') {
      return HIERO_SPACE;
    }
    const upper = character.charCodeAt(0) - 65;
    if (upper >= 0 && upper < 26) {
      return HIERO_UPPER[upper];
    }
    const lower = character.charCodeAt(0) - 97;
    if (lower >= 0 && lower < 26) {
      return HIERO_LOWER[lower];
    }
    return character;
  }).join('');
}

function encodeBase64UrlVisual(text: string, encode: (value: number) => string): string {
  const encoded = bytesToBase64Url(utf8ToBytes(text));
  return Array.from(encoded, (character) => encode(BASE64URL_ALPHABET.indexOf(character))).join(' ');
}

function decodeBase64UrlVisual(text: string, decode: (token: string) => number): string {
  let encoded = '';
  for (const token of text.split(/\s+/).filter(Boolean)) {
    const value = decode(token);
    if (value < 0 || value >= BASE64URL_ALPHABET.length) {
      throw new Error('Invalid visual payload.');
    }
    encoded += BASE64URL_ALPHABET[value];
  }
  return bytesToUtf8(base64UrlToBytes(encoded));
}

function baconBits(text: string, reverse: boolean): string {
  if (!reverse) {
    return encodeBase64UrlVisual(text, (value) =>
      Array.from({ length: 6 }, (_, bit) => (((value >> (5 - bit)) & 1) === 1 ? '▓' : '░')).join(''),
    );
  }
  return decodeBase64UrlVisual(text, (token) => {
    if (!/^[░▓]{6}$/.test(token)) {
      throw new Error('Invalid Bacon token.');
    }
    let value = 0;
    for (const cell of token) {
      value = (value << 1) | (cell === '▓' ? 1 : 0);
    }
    return value;
  });
}

function tapMatrix(text: string, reverse: boolean): string {
  if (!reverse) {
    return encodeBase64UrlVisual(text, (value) => {
      const row = Math.floor(value / 8);
      const column = value % 8;
      return `${'•'.repeat(row + 1)}/${'•'.repeat(column + 1)}`;
    });
  }
  return decodeBase64UrlVisual(text, (token) => {
    const [row, column] = token.split('/');
    if (!row || !column || !/^•{1,8}$/.test(row) || !/^•{1,8}$/.test(column)) {
      throw new Error('Invalid tap token.');
    }
    const value = (row.length - 1) * 8 + (column.length - 1);
    return value < BASE64URL_ALPHABET.length ? value : -1;
  });
}

function morseSignal(text: string, reverse: boolean): string {
  if (!reverse) {
    return encodeBase64UrlVisual(text, (value) => MORSE_CODES[value]);
  }
  return decodeBase64UrlVisual(text, (token) => {
    const value = MORSE_DECODE.get(token);
    if (value === undefined) {
      throw new Error('Invalid Morse token.');
    }
    return BASE64URL_ALPHABET.indexOf(value);
  });
}

function columnWidth(key: string, length: number): number {
  return Math.min(Math.max(letterKey(key).length, 1), Math.max(length, 1), 12);
}

function columnOrder(key: string, width: number): number[] {
  const source = letterKey(key);
  return Array.from({ length: width }, (_, index) => index).sort((first, second) => {
    const left = `${source[first % source.length]}${first.toString().padStart(4, '0')}`;
    const right = `${source[second % source.length]}${second.toString().padStart(4, '0')}`;
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

function keyedColumns(text: string, key: string, reverse: boolean): string {
  const characters = Array.from(text);
  if (characters.length === 0) {
    return text;
  }

  const width = columnWidth(key, characters.length);
  const rows = Math.ceil(characters.length / width);
  const order = columnOrder(key, width);

  if (!reverse) {
    return order
      .flatMap((column) => {
        const output: string[] = [];
        for (let row = 0; row < rows; row += 1) {
          const index = row * width + column;
          if (index < characters.length) {
            output.push(characters[index]);
          }
        }
        return output;
      })
      .join('');
  }

  const baseLength = Math.floor(characters.length / width);
  const extra = characters.length % width;
  const lengths = Array.from({ length: width }, (_, column) => baseLength + (column < extra ? 1 : 0));
  const columns: string[][] = Array.from({ length: width }, () => []);
  let cursor = 0;
  for (const column of order) {
    const length = lengths[column];
    columns[column] = characters.slice(cursor, cursor + length);
    cursor += length;
  }

  const output = new Array<string>(characters.length);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      if (index < characters.length) {
        output[index] = columns[column][row] ?? '';
      }
    }
  }
  return output.join('');
}

export function applyClassic(cipherId: CipherId, text: string, key: string): string {
  switch (cipherId) {
    case 'SH-C007':
      return caesar(text, false);
    case 'SH-V001':
      return vigenere(text, key, false);
    case 'SH-X001':
      return bytesToBase64Url(xorBytes(utf8ToBytes(text), utf8ToBytes(key || 'SHETA')));
    case 'SH-R003':
      return railFence(text, 3, false);
    case 'SH-H001':
      return hieroglyph(text, false);
    case 'SH-T002':
      return tapMatrix(text, false);
    case 'SH-B003':
      return baconBits(text, false);
    case 'SH-M004':
      return morseSignal(text, false);
    case 'SH-K005':
      return keyedColumns(text, key, false);
    case 'SH-A256':
      return text;
  }
}

export function reverseClassic(cipherId: CipherId, text: string, key: string): string {
  switch (cipherId) {
    case 'SH-C007':
      return caesar(text, true);
    case 'SH-V001':
      return vigenere(text, key, true);
    case 'SH-X001':
      return bytesToUtf8(xorBytes(base64UrlToBytes(text), utf8ToBytes(key || 'SHETA')));
    case 'SH-R003':
      return railFence(text, 3, true);
    case 'SH-H001':
      return hieroglyph(text, true);
    case 'SH-T002':
      return tapMatrix(text, true);
    case 'SH-B003':
      return baconBits(text, true);
    case 'SH-M004':
      return morseSignal(text, true);
    case 'SH-K005':
      return keyedColumns(text, key, true);
    case 'SH-A256':
      return text;
  }
}
