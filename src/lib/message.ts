import * as Crypto from 'expo-crypto';

import {
  base64UrlToBytes,
  base64UrlToString,
  bytesToBase64,
  bytesToBase64Url,
  bytesToUtf8,
  concatBytes,
  stringToBase64Url,
  utf8ToBytes,
} from './binary';
import { applyClassic, getCipher, reverseClassic, type CipherDefinition, type CipherId } from './ciphers';
import { sha256 } from './sha256';

const SALT_BYTES = 16;
const KDF_ROUNDS = 4000;
const PASSWORD_ON = '1';
const PASSWORD_OFF = '0';

export class PasswordRequiredError extends Error {}
export class InvalidMessageError extends Error {}
export class WrongPasswordError extends Error {}

export interface EncodedMessage {
  payload: string;
  cipherId: CipherId;
  passwordProtected: boolean;
}

export interface DecodedMessage {
  text: string;
  cipher: CipherDefinition;
  passwordProtected: boolean;
}

export interface MessageInfo {
  payload: string;
  cipher: CipherDefinition;
  passwordProtected: boolean;
}

function normalizedPassword(password: string): string {
  return password.trim().length > 0 ? password : '';
}

function formatEnvelope(payload: string, cipherId: CipherId, passwordProtected: boolean): string {
  return `${payload}|${cipherId}|${passwordProtected ? PASSWORD_ON : PASSWORD_OFF}`;
}

function parseEnvelope(input: string): EncodedMessage {
  const trimmed = input.trim();
  const segments = trimmed.split('|');
  if (segments.length !== 3) {
    throw new InvalidMessageError('Unrecognized payload. Expected payload|cipherId|pwd.');
  }
  const payload = segments[0].trim();
  const cipherId = segments[1].trim();
  const flag = segments[2].trim();
  const cipher = getCipher(cipherId);
  if (!cipher) {
    throw new InvalidMessageError('Unknown cipher id. Use the exact copied payload, not the animated preview.');
  }
  if (flag !== PASSWORD_ON && flag !== PASSWORD_OFF) {
    throw new InvalidMessageError('Invalid password flag in payload.');
  }
  if (!payload.startsWith('S')) {
    throw new InvalidMessageError('Invalid Sheta payload.');
  }
  return { payload, cipherId: cipher.id, passwordProtected: flag === PASSWORD_ON };
}

function authenticatedData(cipherId: CipherId, passwordProtected: boolean): Uint8Array {
  return utf8ToBytes(`sheta:v1:${cipherId}:${passwordProtected ? PASSWORD_ON : PASSWORD_OFF}`);
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Crypto.AESEncryptionKey> {
  const saltTag = bytesToBase64Url(salt);
  let digest = sha256(concatBytes(utf8ToBytes(`sheta:v1:${saltTag}:`), utf8ToBytes(password)));
  for (let round = 0; round < KDF_ROUNDS; round += 1) {
    digest = sha256(concatBytes(digest, utf8ToBytes(`:${round}:${password}:${saltTag}`)));
  }
  const imported = await Crypto.AESEncryptionKey.import(bytesToBase64(digest), 'base64');
  return imported as Crypto.AESEncryptionKey;
}

async function generateKey(): Promise<Crypto.AESEncryptionKey> {
  const key = await Crypto.AESEncryptionKey.generate();
  return key as Crypto.AESEncryptionKey;
}

async function seal(
  data: Uint8Array,
  key: Crypto.AESEncryptionKey,
  cipherId: CipherId,
  passwordProtected: boolean,
): Promise<Uint8Array> {
  const sealed = await Crypto.aesEncryptAsync(data, key, {
    additionalData: authenticatedData(cipherId, passwordProtected),
  });
  return (await sealed.combined()) as Uint8Array;
}

async function open(
  data: Uint8Array,
  key: Crypto.AESEncryptionKey,
  cipherId: CipherId,
  passwordProtected: boolean,
): Promise<Uint8Array> {
  const sealed = Crypto.AESSealedData.fromCombined(data);
  const decrypted = await Crypto.aesDecryptAsync(sealed, key, {
    output: 'bytes' as const,
    additionalData: authenticatedData(cipherId, passwordProtected),
  });
  return decrypted as Uint8Array;
}

export function inspectMessage(input: string): MessageInfo {
  const envelope = parseEnvelope(input);
  const cipher = getCipher(envelope.cipherId);
  if (!cipher) {
    throw new InvalidMessageError('Unknown cipher id in payload.');
  }
  return { payload: envelope.payload, cipher, passwordProtected: envelope.passwordProtected };
}

export async function encryptMessage(
  text: string,
  cipherId: CipherId,
  password: string,
): Promise<string> {
  if (!getCipher(cipherId)) {
    throw new InvalidMessageError('Unknown cipher id.');
  }
  const secret = normalizedPassword(password);
  const passwordProtected = secret.length > 0;

  if (cipherId === 'SH-A256') {
    const plaintext = utf8ToBytes(text);
    if (passwordProtected) {
      const salt = Crypto.getRandomBytes(SALT_BYTES);
      const key = await deriveKey(secret, salt);
      const sealed = await seal(plaintext, key, cipherId, true);
      return formatEnvelope(`S4.${bytesToBase64Url(salt)}.${bytesToBase64Url(sealed)}`, cipherId, true);
    }
    const key = await generateKey();
    const sealed = await seal(plaintext, key, cipherId, false);
    const keyBytes = await key.bytes();
    return formatEnvelope(`S3.${bytesToBase64Url(sealed)}.${bytesToBase64Url(keyBytes)}`, cipherId, false);
  }

  const transformed = applyClassic(cipherId, text, secret);
  if (!passwordProtected) {
    return formatEnvelope(`S1.${stringToBase64Url(transformed)}`, cipherId, false);
  }

  const salt = Crypto.getRandomBytes(SALT_BYTES);
  const key = await deriveKey(secret, salt);
  const sealed = await seal(utf8ToBytes(transformed), key, cipherId, true);
  return formatEnvelope(`S2.${bytesToBase64Url(salt)}.${bytesToBase64Url(sealed)}`, cipherId, true);
}

export async function decryptMessage(input: string, password: string): Promise<DecodedMessage> {
  const envelope = parseEnvelope(input);
  const cipher = getCipher(envelope.cipherId);
  if (!cipher) {
    throw new InvalidMessageError('Unknown cipher id in payload.');
  }
  const secret = normalizedPassword(password);
  if (envelope.passwordProtected && secret.length === 0) {
    throw new PasswordRequiredError('Password required.');
  }

  const fields = envelope.payload.split('.');
  const tag = fields[0];

  try {
    if (tag === 'S1' && !envelope.passwordProtected && fields.length === 2) {
      const transformed = fields[1];
      if (!transformed) {
        throw new InvalidMessageError('Empty payload.');
      }
      return {
        text: reverseClassic(envelope.cipherId, base64UrlToString(transformed), secret),
        cipher,
        passwordProtected: false,
      };
    }

    if (tag === 'S2' && envelope.passwordProtected && fields.length === 3) {
      const salt = base64UrlToBytes(fields[1]);
      const sealed = base64UrlToBytes(fields[2]);
      const key = await deriveKey(secret, salt);
      const transformedBytes = await open(sealed, key, envelope.cipherId, true);
      return {
        text: reverseClassic(envelope.cipherId, bytesToUtf8(transformedBytes), secret),
        cipher,
        passwordProtected: true,
      };
    }

    if (tag === 'S3' && !envelope.passwordProtected && fields.length === 3) {
      const sealed = base64UrlToBytes(fields[1]);
      const keyBytes = base64UrlToBytes(fields[2]);
      const key = (await Crypto.AESEncryptionKey.import(keyBytes)) as Crypto.AESEncryptionKey;
      const plaintext = await open(sealed, key, envelope.cipherId, false);
      return { text: bytesToUtf8(plaintext), cipher, passwordProtected: false };
    }

    if (tag === 'S4' && envelope.passwordProtected && fields.length === 3) {
      const salt = base64UrlToBytes(fields[1]);
      const sealed = base64UrlToBytes(fields[2]);
      const key = await deriveKey(secret, salt);
      const plaintext = await open(sealed, key, envelope.cipherId, true);
      return { text: bytesToUtf8(plaintext), cipher, passwordProtected: true };
    }

    throw new InvalidMessageError('Payload format does not match its cipher header.');
  } catch (error) {
    if (error instanceof InvalidMessageError || error instanceof PasswordRequiredError) {
      throw error;
    }
    throw new WrongPasswordError('Password rejected or payload was modified.');
  }
}
