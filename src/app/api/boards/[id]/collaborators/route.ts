import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmail, isValidEmail, normalizeEmail } from "@/lib/session";
import { addCollaborator, listCollaborators, BoardAccessError } from "@/lib/boards";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const collaborators = await listCollaborators(id, email);
    return NextResponse.json(collaborators);
  } catch (err) {
    if (err instanceof BoardAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();

  if (!isValidEmail(body.email)) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  try {
    const collaborator = await addCollaborator(id, email, normalizeEmail(body.email));
    return NextResponse.json(collaborator, { status: 201 });
  } catch (err) {
    if (err instanceof BoardAccessError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
