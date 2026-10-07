import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLUMNS, EFFORTS } from "@/lib/types";

export async function GET() {
  const cards = await prisma.card.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, column, dueDate, effort, owners } = body;

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
