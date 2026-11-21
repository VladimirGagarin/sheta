const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

export function utf8ToBytes(input: string): Uint8Array {
  const output: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    let code = input.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < input.length) {
      const next = input.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index += 1;
      }
    }
    if (code < 0x80) {
      output.push(code);
    } else if (code < 0x800) {
      output.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      output.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      output.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return new Uint8Array(output);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 1) {
    const first = bytes[index];
    if (first < 0x80) {
      output += String.fromCharCode(first);
      continue;
    }
    let code = 0;
    let extra = 0;
    if ((first & 0xe0) === 0xc0) {
      code = first & 0x1f;
      extra = 1;
    } else if ((first & 0xf0) === 0xe0) {
      code = first & 0x0f;
      extra = 2;
    } else if ((first & 0xf8) === 0xf0) {
      code = first & 0x07;
      extra = 3;
    } else {
      output += '\ufffd';
      continue;
    }
    if (index + extra >= bytes.length) {
      output += '\ufffd';
      break;
    }
    let valid = true;
    for (let offset = 1; offset <= extra; offset += 1) {
      const next = bytes[index + offset];
      if ((next & 0xc0) !== 0x80) {
        valid = false;
        break;
      }
      code = (code << 6) | (next & 0x3f);
    }
    if (!valid) {
      output += '\ufffd';
      index += extra;
      continue;
    }
    index += extra;
    if (code > 0xffff) {
      const adjusted = code - 0x10000;
      output += String.fromCharCode(0xd800 + (adjusted >> 10), 0xdc00 + (adjusted & 0x3ff));
    } else {
      output += String.fromCharCode(code);
    }
  }
  return output;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    output += BASE64[first >> 2];
    output += BASE64[((first & 0x03) << 4) | ((second ?? 0) >> 4)];
    output += second === undefined ? '=' : BASE64[((second & 0x0f) << 2) | ((third ?? 0) >> 6)];
    output += third === undefined ? '=' : BASE64[third & 0x3f];
  }
  return output;
}

export function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/=+$/g, '');
  const output: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const character of clean) {
    const value = BASE64.indexOf(character);
    if (value < 0) {
      throw new Error('Invalid base64');
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(output);
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = normalized.length % 4;
  const padding = remainder === 0 ? '' : '='.repeat(4 - remainder);
  return base64ToBytes(normalized + padding);
}

export function stringToBase64Url(input: string): string {
  return bytesToBase64Url(utf8ToBytes(input));
}

export function base64UrlToString(input: string): string {
  return bytesToUtf8(base64UrlToBytes(input));
}
