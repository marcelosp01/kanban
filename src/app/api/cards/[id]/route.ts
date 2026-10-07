import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COLUMNS } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { column } = body;

  if (!COLUMNS.some((c) => c.id === column)) {
    return NextResponse.json({ error: "Invalid column" }, { status: 400 });
  }

  const card = await prisma.card.update({
    where: { id },
    data: { column },
  });

  return NextResponse.json(card);
}
