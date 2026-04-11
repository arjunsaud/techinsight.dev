import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Use getUser() for auth verification — it contacts the Supabase Auth server
  // and is tamper-proof, unlike getSession() which only reads cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Retrieve session only after verifying user identity, to get access_token
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const env = getPublicEnv();

  const response = await fetch(`${env.supabaseUrl}/functions/v1/api/article/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  if (!response.ok) {
    return NextResponse.json(body, { status: response.status });
  }

  return NextResponse.json(body);
}
