import { prisma } from "@/lib/prisma";

export type BoardAccess = {
  board: { id: string; name: string; ownerEmail: string; createdAt: Date };
  isOwner: boolean;
};

export class BoardAccessError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getBoardAccess(
  boardId: string,
  email: string
): Promise<BoardAccess | null> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { collaborators: true },
  });
  if (!board) return null;

  const isOwner = board.ownerEmail === email;
  const isCollaborator = board.collaborators.some((c) => c.email === email);
  if (!isOwner && !isCollaborator) return null;

  return { board, isOwner };
}

export async function listBoardsForEmail(email: string) {
  const boards = await prisma.board.findMany({
    where: {
      OR: [{ ownerEmail: email }, { collaborators: { some: { email } } }],
    },
    include: { _count: { select: { cards: true } } },
    orderBy: { createdAt: "asc" },
  });

  return boards.map((board) => ({
    id: board.id,
    name: board.name,
    ownerEmail: board.ownerEmail,
    createdAt: board.createdAt,
    isOwner: board.ownerEmail === email,
    cardCount: board._count.cards,
  }));
}

export async function createBoard(name: string, ownerEmail: string) {
  return prisma.board.create({
    data: { name: name.trim(), ownerEmail },
  });
}

export async function getOrCreateDefaultBoard(email: string) {
  const boards = await listBoardsForEmail(email);
  if (boards.length > 0) return boards[0];

  const board = await createBoard("Meu quadro", email);
  return { ...board, isOwner: true, cardCount: 0 };
}

export async function listCollaborators(boardId: string, requesterEmail: string) {
  const access = await getBoardAccess(boardId, requesterEmail);
  if (!access) throw new BoardAccessError("Quadro não encontrado", 404);
  if (!access.isOwner) {
    throw new BoardAccessError("Apenas o owner pode ver os colaboradores", 403);
  }

  return prisma.boardCollaborator.findMany({
    where: { boardId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addCollaborator(
  boardId: string,
  requesterEmail: string,
  collaboratorEmail: string
) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new BoardAccessError("Quadro não encontrado", 404);
  if (board.ownerEmail !== requesterEmail) {
    throw new BoardAccessError("Apenas o owner pode convidar colaboradores", 403);
  }
  if (collaboratorEmail === board.ownerEmail) {
    throw new BoardAccessError("Este e-mail já é o owner do quadro", 400);
  }

  return prisma.boardCollaborator.upsert({
    where: { boardId_email: { boardId, email: collaboratorEmail } },
    update: {},
    create: { boardId, email: collaboratorEmail },
  });
}

export async function removeCollaborator(
  boardId: string,
  requesterEmail: string,
  collaboratorEmail: string
) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) throw new BoardAccessError("Quadro não encontrado", 404);
  if (board.ownerEmail !== requesterEmail) {
    throw new BoardAccessError("Apenas o owner pode remover colaboradores", 403);
  }

  await prisma.boardCollaborator.deleteMany({
    where: { boardId, email: collaboratorEmail },
  });
}
