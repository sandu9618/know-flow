export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

export function warnIfMissingApiUrl(): void {
  if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    console.warn(
      '[KnowFlow] VITE_API_URL is not set. Copy .env.example to .env at the repo root.',
    );
  }
}
