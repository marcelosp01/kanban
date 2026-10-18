import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Card, BoardSummary } from "@/lib/types";
import { getCurrentEmail } from "@/lib/session";
import { listBoardsForEmail, getOrCreateDefaultBoard } from "@/lib/boards";
import Board from "@/components/Board";
import LoginGate from "@/components/LoginGate";

function serializeBoard(board: {
  id: string;
  name: string;
  ownerEmail: string;
  createdAt: Date;
  isOwner: boolean;
  cardCount: number;
}): BoardSummary {
  return { ...board, createdAt: board.createdAt.toISOString() };
}

async function BoardData({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const { board: boardId } = await searchParams;
  const email = await getCurrentEmail();
  if (!email) return <LoginGate />;

  const boards = (await listBoardsForEmail(email)).map(serializeBoard);
  let currentBoard = boardId
    ? boards.find((b) => b.id === boardId) ?? boards[0]
    : boards[0];

  if (!currentBoard) {
    currentBoard = serializeBoard(await getOrCreateDefaultBoard(email));
    boards.push(currentBoard);
  }

  const cards = await prisma.card.findMany({
    where: { boardId: currentBoard.id },
    orderBy: { createdAt: "asc" },
  });

  const serializedCards: Card[] = cards.map((card) => ({
    ...card,
    createdAt: card.createdAt.toISOString(),
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
  }));

  return (
    <Board
      key={currentBoard.id}
      initialCards={serializedCards}
      boards={boards}
      currentBoard={currentBoard}
      currentEmail={email}
    />
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 dark:bg-black">
      <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Carregando quadro...</p>}>
        <BoardData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
