"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, COLUMNS, ColumnId, BoardSummary } from "@/lib/types";
import { buildBoardShareText, currentUrl } from "@/lib/share";
import Column from "./Column";
import AddCardModal from "./AddCardModal";
import EditCardModal from "./EditCardModal";
import ShareMenu from "./ShareMenu";
import NewBoardModal from "./NewBoardModal";
import InviteModal from "./InviteModal";

type Props = {
  initialCards: Card[];
  boards: BoardSummary[];
  currentBoard: BoardSummary;
  currentEmail: string;
};

export default function Board({
  initialCards,
  boards,
  currentBoard,
  currentEmail,
}: Props) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeColumn, setActiveColumn] = useState<ColumnId | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleCreated(card: Card) {
    setCards((prev) => [...prev, card]);
    setActiveColumn(null);
  }

  function handleUpdated(card: Card) {
    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
    setEditingCard(null);
  }

  function handleBoardChange(boardId: string) {
    router.push(`/?board=${boardId}`);
  }

  function handleBoardCreated(board: { id: string }) {
    setShowNewBoard(false);
    router.push(`/?board=${board.id}`);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/session", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function handleDragStart(e: React.DragEvent, cardId: string) {
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(cardId);
  }

  function handleDragEnd() {
    setDraggingCardId(null);
    setDragOverColumn(null);
  }

  async function handleDrop(column: ColumnId) {
    const cardId = draggingCardId;
    setDraggingCardId(null);
    setDragOverColumn(null);
    if (!cardId) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.column === column) return;

    const previousColumn = card.column;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column } : c))
    );

    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ column }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, column: previousColumn } : c))
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={currentBoard.id}
            onChange={(e) => handleBoardChange(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewBoard(true)}
            className="rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
          >
            + Novo quadro
          </button>
        </div>

        <div className="flex items-center gap-2">
          {currentBoard.isOwner && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
            >
              Colaboradores
            </button>
          )}
          <ShareMenu
            label="Compartilhar quadro"
            text={buildBoardShareText(cards)}
            url={currentUrl()}
            triggerClassName="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M13 4a2 2 0 1 0-1.995 2.154l-4.03 2.42a2 2 0 1 0 0 2.852l4.03 2.42a2 2 0 1 0 .962-1.724l-4.03-2.42a2.01 2.01 0 0 0 0-.404l4.03-2.42A2 2 0 0 0 13 4Z" />
            </svg>
            Compartilhar
          </ShareMenu>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {currentEmail}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            label={column.label}
            cards={cards.filter((c) => c.column === column.id)}
            onAddClick={setActiveColumn}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggingCardId={draggingCardId}
            isDragOver={dragOverColumn === column.id}
            onDragOver={setDragOverColumn}
            onEdit={setEditingCard}
          />
        ))}
      </div>

      {activeColumn && (
        <AddCardModal
          boardId={currentBoard.id}
          column={activeColumn}
          columnLabel={COLUMNS.find((c) => c.id === activeColumn)!.label}
          onClose={() => setActiveColumn(null)}
          onCreated={handleCreated}
        />
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onUpdated={handleUpdated}
        />
      )}

      {showNewBoard && (
        <NewBoardModal
          onClose={() => setShowNewBoard(false)}
          onCreated={handleBoardCreated}
        />
      )}

      {showInvite && (
        <InviteModal boardId={currentBoard.id} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
