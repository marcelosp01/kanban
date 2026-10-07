"use client";

import { useState } from "react";
import { Card, COLUMNS, ColumnId } from "@/lib/types";
import Column from "./Column";
import AddCardModal from "./AddCardModal";

export default function Board({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeColumn, setActiveColumn] = useState<ColumnId | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  function handleCreated(card: Card) {
    setCards((prev) => [...prev, card]);
    setActiveColumn(null);
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
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Quadro Kanban
      </h1>

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
    </div>
  );
}
