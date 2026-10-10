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

Next.js App Router app with a single Prisma model (`Card`) backing a 4-column Kanban board (TODO/DOING/TESTING/DONE). SQLite DB file lives at `prisma/dev.db`, connection string in `.env` (`DATABASE_URL`).

- `src/lib/types.ts` is the single source of truth for domain enums: `COLUMNS` and `EFFORTS` are declared as const arrays and also drive the TypeScript unions (`ColumnId`, `Effort`). The API routes validate against these same arrays, so adding a column/effort value only requires editing this file plus a Prisma migration for the matching enum in `schema.prisma`.
- `src/lib/prisma.ts` exports a singleton `PrismaClient`, cached on `globalThis` in non-production to survive dev hot-reloads.
- Server/client split: `src/app/page.tsx` is a server component that fetches cards directly via Prisma (dates serialized to ISO strings) and passes them as `initialCards` into `Board`, a client component that owns all board state afterward. There is no client-side fetch-on-mount — the board is seeded entirely from the server render.
- `Board.tsx` holds all cross-column state (cards list, active drag, which column's "add card" modal is open, which card is being edited) and implements optimistic drag-and-drop: on drop it updates local state immediately, PATCHes `/api/cards/[id]` with the new column, and rolls back local state if the request fails. `Column`/`CardItem` are presentational and receive drag/edit handlers as props.
- `PATCH /api/cards/[id]` (`src/app/api/cards/[id]/route.ts`) does a partial update: any of `title`/`description`/`column`/`dueDate`/`effort`/`owners` present in the body is validated and applied, fields omitted are left untouched. Drag-and-drop uses it with just `{ column }`; `EditCardModal` uses it with the full form.
- API routes do manual request-body validation against `COLUMNS`/`EFFORTS` rather than a schema library — follow that pattern (no zod/yup in this project) when adding fields.
- Dates are formatted by slicing the `yyyy-mm-dd` prefix off the ISO string directly (see `formatDate` in `CardItem.tsx` and `toDateInputValue` in `EditCardModal.tsx`), not via `toLocaleDateString`/`new Date().getDate()`. Those apply the browser's local timezone to a UTC-midnight timestamp and silently shift the displayed day — keep new date-rendering code on the slice approach.
- `src/lib/share.ts` + `src/components/ShareMenu.tsx` implement sharing: `ShareMenu` is a generic trigger-button-plus-popover (click-outside-to-close) that lists `SHARE_TARGETS` (WhatsApp/X/LinkedIn/Facebook/Email intent links) plus a "Copiar link" clipboard action; `buildCardShareText`/`buildBoardShareText` generate the pt-BR share text. It's used both per-card (`CardItem`) and for the whole board (`Board` header). All sharing is client-side (pre-filled intent URLs) — there is no public/unauthenticated read endpoint, so shared links only resolve for someone who can already reach this app's URL.
- UI strings (labels, placeholders, form copy) are in Portuguese (pt-BR); keep new user-facing text consistent with that.
- Styling is Tailwind utility classes inline in JSX, with explicit `dark:` variants throughout — no separate theme/config file to update.
