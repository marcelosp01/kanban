import { Card, ColumnId } from "@/lib/types";
import CardItem from "./CardItem";

type Props = {
  id: ColumnId;
  label: string;
  cards: Card[];
  onAddClick: (column: ColumnId) => void;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragEnd: () => void;
  onDrop: (column: ColumnId) => void;
  draggingCardId: string | null;
  isDragOver: boolean;
  onDragOver: (column: ColumnId) => void;
};

export default function Column({
  id,
  label,
  cards,
  onAddClick,
  onDragStart,
  onDragEnd,
  onDrop,
  draggingCardId,
  isDragOver,
  onDragOver,
}: Props) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(id);
      }}
      className={`flex w-72 shrink-0 flex-col rounded-xl bg-zinc-100 transition-colors dark:bg-zinc-900/50 ${
        isDragOver ? "ring-2 ring-zinc-400 dark:ring-zinc-600" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 pt-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {label}
        </h2>
        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {cards.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            dragging={draggingCardId === card.id}
          />
        ))}
      </div>

      <button
        onClick={() => onAddClick(id)}
        className="m-3 mt-0 rounded-md border border-dashed border-zinc-300 py-2 text-sm font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
      >
        + Adicionar card
      </button>
    </div>
  );
}
