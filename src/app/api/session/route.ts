import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, SESSION_COOKIE } from "@/lib/session";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const res = NextResponse.json({ email: normalizeEmail(email) });
  res.cookies.set(SESSION_COOKIE, normalizeEmail(email), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
