import { Card, EFFORTS } from "@/lib/types";
import { buildCardShareText, currentUrl } from "@/lib/share";
import ShareMenu from "./ShareMenu";

const EFFORT_STYLES: Record<string, string> = {
  SMALL: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  LARGE: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatDate(value: string | null) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

type Props = {
  card: Card;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragEnd: () => void;
  dragging: boolean;
  onEdit: (card: Card) => void;
};

export default function CardItem({ card, onDragStart, onDragEnd, dragging, onEdit }: Props) {
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
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${EFFORT_STYLES[card.effort]}`}
          >
            {effortLabel}
          </span>
          <ShareMenu
            label="Compartilhar card"
            text={buildCardShareText(card)}
            url={currentUrl()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M13 4a2 2 0 1 0-1.995 2.154l-4.03 2.42a2 2 0 1 0 0 2.852l4.03 2.42a2 2 0 1 0 .962-1.724l-4.03-2.42a2.01 2.01 0 0 0 0-.404l4.03-2.42A2 2 0 0 0 13 4Z" />
            </svg>
          </ShareMenu>
          <button
            type="button"
            aria-label="Editar card"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
            </svg>
          </button>
        </div>
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
