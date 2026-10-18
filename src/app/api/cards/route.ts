import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLUMNS, EFFORTS } from "@/lib/types";
import { getCurrentEmail } from "@/lib/session";
import { getBoardAccess } from "@/lib/boards";

export async function GET(request: NextRequest) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const boardId = request.nextUrl.searchParams.get("boardId");
  if (!boardId) {
    return NextResponse.json({ error: "boardId é obrigatório" }, { status: 400 });
  }

  const access = await getBoardAccess(boardId, email);
  if (!access) {
    return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 });
  }

  const cards = await prisma.card.findMany({
    where: { boardId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, column, dueDate, effort, owners, boardId } = body;

  if (typeof boardId !== "string" || boardId.trim() === "") {
    return NextResponse.json({ error: "boardId é obrigatório" }, { status: 400 });
  }
  const access = await getBoardAccess(boardId, email);
  if (!access) {
    return NextResponse.json({ error: "Quadro não encontrado" }, { status: 404 });
  }

  if (typeof title !== "string" || title.trim() === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!COLUMNS.some((c) => c.id === column)) {
    return NextResponse.json({ error: "Invalid column" }, { status: 400 });
  }
  if (!EFFORTS.some((e) => e.id === effort)) {
    return NextResponse.json({ error: "Invalid effort" }, { status: 400 });
  }

  const card = await prisma.card.create({
    data: {
      boardId,
      title: title.trim(),
      description: description?.trim() || null,
      column,
      dueDate: dueDate ? new Date(dueDate) : null,
      effort,
      owners: typeof owners === "string" ? owners.trim() : "",
    },
  });

  return NextResponse.json(card, { status: 201 });
}
