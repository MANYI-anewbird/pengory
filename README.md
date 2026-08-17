# Pengory

A minimal calendar + task dashboard for planning the week without the usual clutter.

Calendar, tasks, notes, links, and a small personal-growth board in one quiet surface — built after a ~20-person pilot as customer discovery.

---

## What’s in it

- **Calendar** — month view with repeating tasks
- **Home** — today / tomorrow, reminders, a compact week
- **Notes, links, learn, growth** — lightweight side rooms, not another all-in-one suite
- **Auth** — optional Supabase login so the same plan can follow you

---

## Stack

Vite · React · TypeScript · Tailwind · shadcn/ui · Framer Motion · Supabase

---

## Local setup

```sh
git clone https://github.com/MANYI-anewbird/pengory.git
cd pengory
npm install
cp .env.example .env
```

Fill in `.env` from your [Supabase](https://app.supabase.com) project (**Settings → API**):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon / publishable key)

```sh
npm run dev
```

App runs at [http://localhost:8080](http://localhost:8080).

---

## Scripts

| Command | |
|---|---|
| `npm run dev` | Dev server (port 8080) |
| `npm run build` | Production build |
| `npm run preview` | Preview the build |
| `npm run lint` | ESLint |

---

## License

MIT. See [LICENSE](LICENSE).
