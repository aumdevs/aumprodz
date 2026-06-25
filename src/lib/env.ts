const OPTIONAL_WHITESPACE = /^\s*$/;

export function getEnv(name: string) {
  const value = process.env[name];
  return value && !OPTIONAL_WHITESPACE.test(value) ? value : undefined;
}

export function hasEnv(...names: string[]) {
  return names.every((name) => Boolean(getEnv(name)));
}

export function getAppBaseUrl() {
  return (
    getEnv("APP_BASE_URL") ??
    getEnv("NEXT_PUBLIC_APP_BASE_URL") ??
    "http://localhost:3000"
  );
}

export function isSupabaseConfigured() {
  return hasEnv("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function isSupabaseServiceConfigured() {
  return hasEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  );
}

export function getWhatsAppNumber() {
  return getEnv("AUM_WHATSAPP_NUMBER");
}

export function getRequiredEnv(name: string) {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
