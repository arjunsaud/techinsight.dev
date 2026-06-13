export {};

declare global {
  interface Window {
    __ENV__: {
      APP_URL: string;
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      GA_ID: string | undefined;
    };
  }
}
