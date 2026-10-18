import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmail, normalizeEmail } from "@/lib/session";
import { removeCollaborator, BoardAccessError } from "@/lib/boards";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; email: string }> }
) {
  const requesterEmail = await getCurrentEmail();
  if (!requesterEmail) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id, email } = await params;

  try {
    await removeCollaborator(id, requesterEmail, normalizeEmail(decodeURIComponent(email)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof BoardAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
