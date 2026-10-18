# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)
- `npm run db:seed` — run `prisma/seed.ts` (idempotent: checks for the `KAB-1` card by title before inserting)
- `npx prisma migrate dev` — create/apply a migration after editing `prisma/schema.prisma`
- `npx prisma studio` — inspect the SQLite DB at `prisma/dev.db`

There is no test suite configured in this repo.

## Architecture

Next.js App Router app with Prisma models `Board`, `BoardCollaborator`, and `Card` backing one or more 4-column Kanban boards (TODO/DOING/TESTING/DONE) per user. SQLite DB file lives at `prisma/dev.db`, connection string in `.env` (`DATABASE_URL`).

- `src/lib/types.ts` is the single source of truth for domain enums: `COLUMNS` and `EFFORTS` are declared as const arrays and also drive the TypeScript unions (`ColumnId`, `Effort`). The API routes validate against these same arrays, so adding a column/effort value only requires editing this file plus a Prisma migration for the matching enum in `schema.prisma`. It also declares `Board`, `BoardCollaborator`, and `BoardSummary` (a `Board` plus `isOwner`/`cardCount`, as returned by `listBoardsForEmail`).
- `src/lib/prisma.ts` exports a singleton `PrismaClient`, cached on `globalThis` in non-production to survive dev hot-reloads.

### Auth and multi-board access

There's no password auth — `src/lib/session.ts` implements a trust-on-email session: `POST /api/session` validates the email format and sets an httpOnly cookie (`kanban_email`, 1yr, no verification); `getCurrentEmail()` reads it server-side. Every `Card` belongs to a `Board` (`ownerEmail` + `BoardCollaborator` rows for sharing); `src/lib/boards.ts` is the single place access control is enforced:
- `getBoardAccess(boardId, email)` — null unless the email is the owner or a `BoardCollaborator`; all card API routes call this before reading/writing.
- `listBoardsForEmail(email)` — boards owned by or shared with that email, used both to render the board switcher and as the allowlist when resolving a `?board=` id (an id not in this list silently falls back to the user's own board rather than leaking a 403/404 distinction — see `page.tsx`).
- `addCollaborator`/`removeCollaborator`/`listCollaborators` throw `BoardAccessError` (carries an HTTP `status`) when the requester isn't the board owner; routes under `src/app/api/boards/[id]/collaborators/` catch it and forward the status.
- `getOrCreateDefaultBoard(email)` auto-creates a "Meu quadro" board the first time a new email logs in and has no boards.

### Rendering

- `src/app/page.tsx` is a server component. `BoardData` (the async component inside the `<Suspense>` boundary) reads `searchParams` itself — reading it in the outer `Home` instead blocks prerendering in this repo's Next.js config (`cacheComponents`/`partialPrefetching` are on in `next.config.ts`); keep dynamic reads (`cookies()`, `searchParams`) inside the Suspense-wrapped component, not above it. No session → renders `LoginGate`. Otherwise it resolves the current `BoardSummary` from `?board=` (falling back to the user's first board, auto-creating one if they have none) and fetches that board's cards (dates serialized to ISO strings) into `Board` as `initialCards`.
- `<Board key={currentBoard.id} .../>` — the `key` is load-bearing. `Board` keeps cards in `useState(initialCards)`, which only reads its argument on mount; switching boards via `router.push` re-renders the same component instance with new props without remounting, so without the per-board `key` the old board's cards stay on screen after a client-side board switch (confirmed by testing — server logs showed correct per-board data on every request, only the client state was stale).
- `Board.tsx` holds all cross-column state (cards list, active drag, which column's "add card" modal is open, which card is being edited, new-board/invite modals) and implements optimistic drag-and-drop: on drop it updates local state immediately, PATCHes `/api/cards/[id]` with the new column, and rolls back local state if the request fails. `Column`/`CardItem` are presentational and receive drag/edit handlers as props. The board switcher `<select>` and "+ Novo quadro" call `router.push(/?board=<id>)`; "Colaboradores" (owner-only, gated on `currentBoard.isOwner`) opens `InviteModal`.
- `POST /api/cards` and `GET /api/cards` require a `boardId` (body or query) and 404 if `getBoardAccess` denies it. `PATCH /api/cards/[id]` (`src/app/api/cards/[id]/route.ts`) loads the existing card first to get its `boardId` for the same access check, then does a partial update: any of `title`/`description`/`column`/`dueDate`/`effort`/`owners` present in the body is validated and applied, fields omitted are left untouched. Drag-and-drop uses it with just `{ column }`; `EditCardModal` uses it with the full form.
- API routes do manual request-body validation against `COLUMNS`/`EFFORTS` rather than a schema library — follow that pattern (no zod/yup in this project) when adding fields.
- Dates are formatted by slicing the `yyyy-mm-dd` prefix off the ISO string directly (see `formatDate` in `CardItem.tsx` and `toDateInputValue` in `EditCardModal.tsx`), not via `toLocaleDateString`/`new Date().getDate()`. Those apply the browser's local timezone to a UTC-midnight timestamp and silently shift the displayed day — keep new date-rendering code on the slice approach.
- `src/lib/share.ts` + `src/components/ShareMenu.tsx` implement sharing: `ShareMenu` is a generic trigger-button-plus-popover (click-outside-to-close) that lists `SHARE_TARGETS` (WhatsApp/X/LinkedIn/Facebook/Email intent links) plus a "Copiar link" clipboard action; `buildCardShareText`/`buildBoardShareText` generate the pt-BR share text. It's used both per-card (`CardItem`) and for the whole board (`Board` header). This is distinct from `InviteModal`'s board-collaborator invites: `ShareMenu` just prefills social/email intent links to the current URL (no server-side access change), while inviting a collaborator is what actually grants board access.
- UI strings (labels, placeholders, form copy) are in Portuguese (pt-BR); keep new user-facing text consistent with that.
- Styling is Tailwind utility classes inline in JSX, with explicit `dark:` variants throughout — no separate theme/config file to update.
