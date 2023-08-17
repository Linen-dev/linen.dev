export type SerializedSearchSettings = {
  engine: 'typesense';
  scope: 'public' | 'private';
  apiKey: string | 'private';
  apiKeyExpiresAt?: number;
  lastSync?: number;
};
