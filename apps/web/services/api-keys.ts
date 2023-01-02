import { prisma } from 'client';
import { createHash, randomBytes } from 'crypto';

export class ApiKeysService {
  private static decryptKey({ token }: { token: string }) {
    const hash = createHash('sha256')
      .update(`${token}${process.env.NEXTAUTH_SECRET}`)
      .digest('hex');
    return hash;
  }

  private static createKey() {
    const token = randomBytes(64).toString('hex');
    const hash = createHash('sha256')
      .update(`${token}${process.env.NEXTAUTH_SECRET}`)
      .digest('hex');
    return { token, hash };
  }

  static async getAccountByApiKey({ apiKey }: { apiKey: string }) {
    const hash = this.decryptKey({ token: apiKey });
    return await prisma.apiKeys.findFirst({
      include: { account: true },
      where: { hash },
    });
  }

  static async list({ accountId }: { accountId: string }) {
    return await prisma.apiKeys.findMany({
      select: { id: true, createdAt: true, name: true, scope: true },
      where: { accountId },
    });
  }

  static async create({
    accountId,
    name,
    scope,
  }: {
    accountId: string;
    name: string;
    scope?: string[];
  }) {
    const { token, hash } = this.createKey();
    await prisma.apiKeys.create({
      data: { name, accountId, scope, hash },
    });
    return { token };
  }

  static async revoke({ id, accountId }: { id: string; accountId: string }) {
    const apiKey = await prisma.apiKeys.findUnique({ where: { id } });
    if (!apiKey) {
      return { ok: false, data: 'not_found' };
    }
    if (apiKey.accountId !== accountId) {
      return { ok: false, data: 'account_mismatch' };
    }
    await prisma.apiKeys.delete({ where: { id: apiKey.id } });
    return { ok: true };
  }
}
