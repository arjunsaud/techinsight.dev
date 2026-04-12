import { NextResponse } from "next/server";

import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { apiFetch } from "@/services/http";

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

  try {
    const body = await apiFetch<any>("article/upload-url", {
      method: "POST",
      accessToken: session.access_token,
      body: payload
    });
    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof Error) {
      // apiFetch throws errors on non-ok responses
      // In this specific handler, we'll try to parse the message as JSON if possible
      try {
        const parsed = JSON.parse(error.message);
        return NextResponse.json(parsed, { status: 400 }); // Assuming bad request if we can parse it
      } catch {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

