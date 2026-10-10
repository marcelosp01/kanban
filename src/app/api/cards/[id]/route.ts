import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLUMNS, EFFORTS, ColumnId, Effort } from "@/lib/types";

type CardUpdateData = Partial<{
  title: string;
  description: string | null;
  column: ColumnId;
  dueDate: Date | null;
  effort: Effort;
  owners: string;
}>;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, column, dueDate, effort, owners } = body;

  const data: CardUpdateData = {};

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    data.title = title.trim();
  }

  if (description !== undefined) {
    data.description =
      typeof description === "string" ? description.trim() || null : null;
  }

  if (column !== undefined) {
    if (!COLUMNS.some((c) => c.id === column)) {
      return NextResponse.json({ error: "Invalid column" }, { status: 400 });
    }
    data.column = column;
  }

  if (effort !== undefined) {
    if (!EFFORTS.some((e) => e.id === effort)) {
      return NextResponse.json({ error: "Invalid effort" }, { status: 400 });
    }
    data.effort = effort;
  }

  if (dueDate !== undefined) {
    data.dueDate = dueDate ? new Date(dueDate) : null;
  }

  if (owners !== undefined) {
    data.owners = typeof owners === "string" ? owners.trim() : "";
  }

  const card = await prisma.card.update({
    where: { id },
    data,
  });

  return NextResponse.json(card);
}
