import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/lib/types";
import Board from "@/components/Board";

async function BoardData() {
  const cards = await prisma.card.findMany({ orderBy: { createdAt: "asc" } });

  const serializedCards: Card[] = cards.map((card) => ({
    ...card,
    createdAt: card.createdAt.toISOString(),
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
  }));

  return <Board initialCards={serializedCards} />;
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Carregando quadro...</p>}>
        <BoardData />
      </Suspense>
    </div>
  );
}
