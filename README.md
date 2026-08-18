# Pengory

**The question:** Planning the week should not require another all-in-one suite. Can one quiet calendar hold today, repeating tasks, and a few side rooms?

Pengory is **your personalized calendar** — month view, today / tomorrow, notes, links, learn, and a small growth board. Built after a ~20-person pilot as customer discovery, then kept small on purpose.

**How we built that:** **Vite + React + TypeScript** month grid with repeating tasks (weekday / month-day, exclude one instance), **localStorage** so it works without an account, and optional **Supabase** login so the same plan can follow you. Dates run on **America/New_York**.

---

## Decision this supports

Most calendars are either a wall of meetings or a second project manager. The waste is opening five apps to see whether Thursday is still free.

Two decisions Pengory is built for:

1. **What is on this week** — a compact month plus today / tomorrow, not a feed.
2. **What repeats, and what to delete** — one instance vs the rest of the series, without losing past days.

---

## What you get

- **Calendar** — month view, dense mode, repeating tasks
- **Home** — today / tomorrow, reminders, a compact week
- **Notes, links, learn, growth** — lightweight side rooms
- **Auth** — optional Supabase login (`/auth`)

Tasks persist in the browser (`pompom_tasks_v1`) until you sign in and sync through your own Supabase project.

---

## What it will not claim

Not Notion. Not a team planner. Not a meditation product (that page is not on the shipped path). No public live demo URL is attached to this repo; run it locally or on your own host.

---

## What’s in the repo

| Path | |
|---|---|
| `src/pages/Index.tsx` | Calendar shell + room switcher |
| `src/pages/Home.tsx` | Today / tomorrow dashboard |
| `src/pages/Notes.tsx` / `Links.tsx` / `Learn.tsx` / `PersonalGrowth.tsx` | Side rooms |
| `src/pages/Auth.tsx` | Supabase login |
| `src/components/calendar/` | Grid, modal, repeat-delete dialog |
| `supabase/migrations/` | Profile / auth tables |

---

## How we built it (technical)

Stack: **Vite** · **React 18** · **TypeScript** · **Tailwind** · **shadcn/ui** · **Framer Motion** · **TanStack Query** · **Supabase JS**. Dev server pinned to port **8080**.

**Tasks.** `Task` in `src/types/task.ts`: `repeat`, `repeatType`, start/end, weekdays, month-days, `excludedDates`. `CompactCalendarGrid` expands repeats for the visible month. Delete-one-instance sets `repeatEndDate` or adds an excluded date (`DeleteRepeatTaskDialog`) so past days stay.

**Persistence.** Default: `localStorage`. Auth: `@/hooks/useAuth` + `profiles` in Supabase. Publishable/anon key only — never a service-role key. `.env` is gitignored; use `.env.example`.

**Limits.** Without your Supabase project, login does nothing useful. Historical git still had a `.env` in old commits (anon key); rotate in the dashboard if that project is still live. `lovable-tagger` remains in `package.json` as a leftover install, unused by `vite.config.ts`.

---

## Setup

```sh
git clone https://github.com/MANYI-anewbird/pengory.git
cd pengory
npm install
cp .env.example .env
```

Fill `.env` from [Supabase](https://app.supabase.com) → **Settings → API**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

```sh
npm run dev
```

App: [http://localhost:8080](http://localhost:8080).

| Command | |
|---|---|
| `npm run dev` | Dev server (8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |

---

## License

MIT. See [LICENSE](LICENSE).
