import type {AccessTokenProvider} from '@anthropic-ai/sdk/lib/credentials/types';
import 'dotenv/config';
import {readFile, writeFile} from 'node:fs/promises';

const authFile = process.env.ANTHROPIC_OAUTH_FILE;

if (!authFile) {
  throw new Error('Missing ANTHROPIC_OAUTH_FILE environment variable');
}

type OpenCodeAuth = {
  anthropic: {
    access: string;
    refresh: string;
    expires: number;
  };
};

const readAuth = async (): Promise<OpenCodeAuth> => {
  const file = JSON.parse(await readFile(authFile, 'utf-8')) as OpenCodeAuth;
  if (!file.anthropic?.access) {
    throw new Error(`No Anthropic OAuth session in ${authFile}`);
  }
  return file;
};

export const claudeOAuthProvider: AccessTokenProvider = async ({
  forceRefresh,
} = {}) => {
  const auth = await readAuth();
  if (!forceRefresh && auth.anthropic.expires - Date.now() > 30_000) {
    return {
      token: auth.anthropic.access,
      expiresAt: Math.floor(auth.anthropic.expires / 1000),
    };
  }
  const resp = await fetch('https://api.anthropic.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-beta': 'oauth-2025-04-20',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: auth.anthropic.refresh,
      client_id: 'claude-cli',
    }),
  });
  if (!resp.ok) {
    throw new Error(
      `OAuth refresh failed: ${resp.status} ${await resp.text()}`,
    );
  }
  const data = (await resp.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  const file = JSON.parse(await readFile(authFile, 'utf-8')) as Record<
    string,
    unknown
  > &
    OpenCodeAuth;
  file.anthropic = {
    ...file.anthropic,
    access: data.access_token,
    refresh: data.refresh_token ?? file.anthropic.refresh,
    expires: Date.now() + data.expires_in * 1000,
  };
  await writeFile(authFile, JSON.stringify(file, null, 2), {mode: 0o600});
  return {
    token: file.anthropic.access,
    expiresAt: Math.floor(file.anthropic.expires / 1000),
  };
};
