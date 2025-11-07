type SupabaseConfig = {
  url?: string;
  anonKey?: string;
};

const WINDOW_URL_KEY = '__NEXT_PUBLIC_SUPABASE_URL';
const WINDOW_ANON_KEY = '__NEXT_PUBLIC_SUPABASE_ANON_KEY';

let cachedConfig: SupabaseConfig | null = null;
let configFetchPromise: Promise<SupabaseConfig> | null = null;

const envPreferenceOrder = {
  url: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL', 'PUBLIC_SUPABASE_URL'] as const,
  anonKey: ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'PUBLIC_SUPABASE_ANON_KEY'] as const,
};

function readWindowValue(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const value = (window as Record<string, unknown>)[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readEnvValue(keys: readonly string[]): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function normaliseConfigValue(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getCachedSupabaseConfig(): SupabaseConfig | null {
  return cachedConfig ? { ...cachedConfig } : null;
}

export function isFetchingSupabaseConfig(): boolean {
  return configFetchPromise !== null;
}

export function setCachedSupabaseConfig(config: SupabaseConfig | null): void {
  cachedConfig = config ? { ...config } : null;
  if (typeof window !== 'undefined' && config) {
    if (config.url) {
      (window as Record<string, unknown>)[WINDOW_URL_KEY] = config.url;
    }
    if (config.anonKey) {
      (window as Record<string, unknown>)[WINDOW_ANON_KEY] = config.anonKey;
    }
  }
}

export function getSupabaseUrl(): string | undefined {
  return (
    normaliseConfigValue(readWindowValue(WINDOW_URL_KEY)) ||
    normaliseConfigValue(cachedConfig?.url) ||
    normaliseConfigValue(readEnvValue(envPreferenceOrder.url))
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    normaliseConfigValue(readWindowValue(WINDOW_ANON_KEY)) ||
    normaliseConfigValue(cachedConfig?.anonKey) ||
    normaliseConfigValue(readEnvValue(envPreferenceOrder.anonKey))
  );
}

export async function fetchSupabaseConfig(): Promise<SupabaseConfig> {
  if (configFetchPromise) {
    return configFetchPromise;
  }

  configFetchPromise = (async () => {
    try {
      const response = await fetch('/api/supabase-config');
      if (!response.ok) {
        return {};
      }

      const data = (await response.json()) as {
        success?: boolean;
        config?: { url?: string; anonKey?: string };
      };

      if (data?.success && data.config) {
        const config: SupabaseConfig = {
          url: normaliseConfigValue(data.config.url),
          anonKey: normaliseConfigValue(data.config.anonKey),
        };

        setCachedSupabaseConfig(config);
        return config;
      }

      return {};
    } catch (error) {
      console.error('❌ [SupabaseConfig] Erro ao buscar configuração via API:', error);
      return {};
    } finally {
      configFetchPromise = null;
    }
  })();

  return configFetchPromise;
}

export function resetSupabaseConfigCache(): void {
  cachedConfig = null;
}

export function hasSupabaseConfig(): boolean {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

export { WINDOW_URL_KEY, WINDOW_ANON_KEY };
