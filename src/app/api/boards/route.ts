import { NextRequest, NextResponse } from "next/server";
import { getCurrentEmail } from "@/lib/session";
import { createBoard, listBoardsForEmail } from "@/lib/boards";

export async function GET() {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const boards = await listBoardsForEmail(email);
  return NextResponse.json(boards);
}

export async function POST(request: NextRequest) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;
  if (typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const board = await createBoard(name, email);
  return NextResponse.json(board, { status: 201 });
}
