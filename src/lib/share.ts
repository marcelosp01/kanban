import { Card, COLUMNS, EFFORTS } from "@/lib/types";

export type ShareTarget = {
  id: string;
  label: string;
  href: (text: string, url: string) => string;
};

export const SHARE_TARGETS: ShareTarget[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (text, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "twitter",
    label: "X (Twitter)",
    href: (text, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: (_text, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: (_text, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "email",
    label: "E-mail",
    href: (text, url) =>
      `mailto:?subject=${encodeURIComponent("Quadro Kanban")}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

export function currentUrl(): string {
  return typeof window !== "undefined" ? window.location.href : "";
}

export function buildCardShareText(card: Card): string {
  const columnLabel =
    COLUMNS.find((c) => c.id === card.column)?.label ?? card.column;
  const effortLabel =
    EFFORTS.find((e) => e.id === card.effort)?.label ?? card.effort;

  const parts = [`${card.title} (${columnLabel})`];
  if (card.description) parts.push(card.description);
  parts.push(`Esforço: ${effortLabel}`);
  if (card.owners) parts.push(`Owners: ${card.owners}`);

  return parts.join(" — ");
}

export function buildBoardShareText(cards: Card[]): string {
  const counts = COLUMNS.map(
    (c) => `${c.label}: ${cards.filter((card) => card.column === c.id).length}`
  ).join(", ");
  return `Confira meu quadro Kanban — ${counts}`;
}
