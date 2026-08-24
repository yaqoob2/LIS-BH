import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'crypto';

import { ClientIdentityType } from '../generated/prisma/client';

@Injectable()
export class ClientIdentityService {
  private readonly masterKey: Buffer;
  private readonly encryptionKey: Buffer;
  private readonly lookupKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.getOrThrow<string>(
      'CLIENT_IDENTITY_ENCRYPTION_KEY',
    );

    if (!/^[a-fA-F0-9]{64}$/.test(key)) {
      throw new InternalServerErrorException(
        'CLIENT_IDENTITY_ENCRYPTION_KEY must be a 64-character hexadecimal key',
      );
    }

    this.masterKey = Buffer.from(key, 'hex');

    this.encryptionKey = createHmac('sha256', this.masterKey)
      .update('client-identity-encryption')
      .digest();

    this.lookupKey = createHmac('sha256', this.masterKey)
      .update('client-identity-lookup')
      .digest();
  }

  normalizeIdentityNumber(value: string) {
    return value.trim().replace(/[\s-]/g, '').toUpperCase();
  }

  createLookupHash(identityType: ClientIdentityType, identityNumber: string) {
    const normalized = this.normalizeIdentityNumber(identityNumber);

    return createHmac('sha256', this.lookupKey)
      .update(`${identityType}:${normalized}`)
      .digest('hex');
  }

  encrypt(identityNumber: string) {
    const normalized = this.normalizeIdentityNumber(identityNumber);

    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(normalized, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  decrypt(encryptedValue: string) {
    const [ivValue, authTagValue, encrypted] = encryptedValue.split('.');

    if (!ivValue || !authTagValue || !encrypted) {
      throw new InternalServerErrorException(
        'Invalid encrypted client identity',
      );
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(ivValue, 'base64'),
    );

    decipher.setAuthTag(Buffer.from(authTagValue, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  mask(identityNumber: string) {
    const normalized = this.normalizeIdentityNumber(identityNumber);

    if (normalized.length <= 4) {
      return '*'.repeat(normalized.length);
    }

    return `${'*'.repeat(normalized.length - 4)}${normalized.slice(-4)}`;
  }
}
