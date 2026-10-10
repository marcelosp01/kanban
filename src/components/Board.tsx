"use client";

import { useState } from "react";
import { Card, COLUMNS, ColumnId } from "@/lib/types";
import { buildBoardShareText, currentUrl } from "@/lib/share";
import Column from "./Column";
import AddCardModal from "./AddCardModal";
import EditCardModal from "./EditCardModal";
import ShareMenu from "./ShareMenu";

export default function Board({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeColumn, setActiveColumn] = useState<ColumnId | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  function handleCreated(card: Card) {
    setCards((prev) => [...prev, card]);
    setActiveColumn(null);
  }

  function handleUpdated(card: Card) {
    setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
    setEditingCard(null);
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quadro Kanban
        </h1>
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
    </div>
  );
}
