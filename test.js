import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api/series/this-is-nestjs?withPosts=true`;

fetch(url, {
  headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
}).then(res => res.text()).then(console.log).catch(console.error);
