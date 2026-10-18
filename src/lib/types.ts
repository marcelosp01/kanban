export const COLUMNS = [
  { id: "TODO", label: "To Do" },
  { id: "DOING", label: "Doing" },
  { id: "TESTING", label: "Testing" },
  { id: "DONE", label: "Done" },
] as const;

export type ColumnId = (typeof COLUMNS)[number]["id"];

export const EFFORTS = [
  { id: "SMALL", label: "Pequeno" },
  { id: "MEDIUM", label: "Médio" },
  { id: "LARGE", label: "Grande" },
] as const;

export type Effort = (typeof EFFORTS)[number]["id"];

export type Card = {
  id: string;
  boardId: string;
  title: string;
  description: string | null;
  column: ColumnId;
  createdAt: string;
  dueDate: string | null;
  effort: Effort;
  owners: string;
};

export type Board = {
  id: string;
  name: string;
  ownerEmail: string;
  createdAt: string;
};

export type BoardCollaborator = {
  id: string;
  boardId: string;
  email: string;
  createdAt: string;
};

export type BoardSummary = Board & {
  isOwner: boolean;
  cardCount: number;
};
