import { Card, EFFORTS } from "@/lib/types";

const EFFORT_STYLES: Record<string, string> = {
  SMALL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  LARGE: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("pt-BR");
}

type Props = {
  card: Card;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragEnd: () => void;
  dragging: boolean;
};

export default function CardItem({ card, onDragStart, onDragEnd, dragging }: Props) {
  const effortLabel = EFFORTS.find((e) => e.id === card.effort)?.label ?? card.effort;
  const owners = card.owners
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const dueDate = formatDate(card.dueDate);
  const createdDate = formatDate(card.createdAt);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-lg border border-zinc-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-900 ${dragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {card.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${EFFORT_STYLES[card.effort]}`}
        >
          {effortLabel}
        </span>
      </div>

      {card.description && (
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          {card.description}
        </p>
      )}

      {owners.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {owners.map((owner) => (
            <span
              key={owner}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {owner}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-500">
        {createdDate && <span>Criado: {createdDate}</span>}
        {dueDate && <span>Previsto: {dueDate}</span>}
      </div>
    </div>
  );
}
