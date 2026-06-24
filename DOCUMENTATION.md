# WanderWise AI — Project Documentation

AI-powered travel planning web app: discover destinations, save favorites, generate itineraries, estimate budgets, and chat with a travel assistant.

---

## 1. Tech Stack

| Layer | Technology |
|------|-----------|
| Language | TypeScript (strict mode) |
| Framework | TanStack Start v1 (React 19, SSR) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Data | TanStack Query v5 |
| Styling | Tailwind CSS v4 (via `src/styles.css`) |
| UI Kit | shadcn/ui + Radix primitives |
| Backend | Lovable Cloud (Supabase Postgres + Auth) |
| Server logic | TanStack server functions (`createServerFn`) |
| AI | Lovable AI Gateway (Gemini models) via `ai` SDK |
| Build | Vite 7 |
| Deploy | Edge (Cloudflare Workers, `nodejs_compat`) |

---

## 2. Project Structure

```
src/
├── routes/
│   ├── __root.tsx              Root layout, head, auth listener
│   ├── index.tsx               Landing page (public)
│   ├── explore.tsx             Browse destinations (public)
│   ├── destination.$id.tsx     Destination detail (public)
│   ├── auth.tsx                Sign in / sign up
│   ├── reset-password.tsx      Password reset
│   ├── api/chat.ts             Public streaming chat endpoint
│   └── _authenticated/         Auth-gated subtree (ssr:false gate)
│       ├── route.tsx           Auth guard (redirects to /auth)
│       ├── dashboard.tsx       User home
│       ├── profile.tsx         Profile editor
│       ├── favorites.tsx       Saved destinations
│       ├── itinerary.tsx       AI itinerary planner
│       ├── budget.tsx          AI budget planner
│       ├── chat.tsx            Chat threads list / new chat
│       └── chat.$threadId.tsx  Chat conversation view
├── lib/
│   ├── ai-gateway.server.ts    Lovable AI client (server-only)
│   ├── config.server.ts        Server env config
│   ├── destinations.ts         Static destinations catalog
│   ├── itineraries.functions.ts  Itinerary CRUD + AI generation
│   ├── budgets.functions.ts    Budget CRUD + AI generation
│   ├── chat.functions.ts       Chat threads + messages CRUD
│   ├── favorites.functions.ts  Favorites CRUD
│   ├── recently.functions.ts   Recently-viewed tracking
│   ├── profile.functions.ts    Profile read/update
│   └── utils.ts                cn() helper
├── components/
│   ├── site-header.tsx         Top nav
│   ├── destination-card.tsx    Destination tile
│   └── ui/                     shadcn/ui components
├── integrations/supabase/
│   ├── client.ts               Browser client (publishable key)
│   ├── client.server.ts        Admin client (service role)
│   ├── auth-middleware.ts      requireSupabaseAuth (server fn middleware)
│   ├── auth-attacher.ts        Attaches bearer to server fn calls
│   └── types.ts                Generated DB types
├── router.tsx                  Router factory
├── start.ts                    Start instance + middleware wiring
├── server.ts                   SSR entry
└── styles.css                  Tailwind v4 + theme tokens
```

---

## 3. Routing

File-based under `src/routes/`. Routes split into two categories:

**Public** (SSR on): `/`, `/explore`, `/destination/$id`, `/auth`, `/reset-password`
**Authenticated** (`_authenticated/` subtree, `ssr:false`): `/dashboard`, `/profile`, `/favorites`, `/itinerary`, `/budget`, `/chat`, `/chat/$threadId`

The `_authenticated/route.tsx` layout calls `supabase.auth.getUser()` in `beforeLoad` and redirects to `/auth` when unauthenticated. All child routes inherit that gate.

---

## 4. Authentication

- **Provider:** Lovable Cloud (Supabase Auth) — email/password
- **Browser session:** persisted in `localStorage` by `@supabase/supabase-js`
- **Server fn auth:** `requireSupabaseAuth` middleware validates the bearer token and exposes `supabase`, `userId`, `claims` on `context`
- **Bearer attachment:** `attachSupabaseAuth` is registered as a global `functionMiddleware` in `src/start.ts` so every server fn call carries the user's token automatically
- **Profile creation:** `handle_new_user()` Postgres trigger seeds a `profiles` row on signup

---

## 5. Database (Lovable Cloud / Supabase)

All tables live in `public`, RLS enabled, scoped to `auth.uid()`. No storage buckets.

### Tables

| Table | Purpose | Key Columns | Used By |
|-------|---------|-------------|---------|
| `profiles` | User profile | `id` (=auth.users.id), `email`, `display_name`, `bio`, `travel_style` | Profile page, header |
| `favorites` | Saved destinations | `user_id`, `destination_id`, `destination_name`, `image_url`, `attraction_name` | Favorites page, destination detail |
| `recently_viewed` | Recently viewed destinations | `user_id`, `destination_id`, `destination_name`, `image_url`, `viewed_at` | Dashboard |
| `itineraries` | AI-generated itineraries | `user_id`, `destination`, `duration`, `interests[]`, `itinerary_content` | Itinerary page |
| `budgets` | AI-generated budgets | `user_id`, `destination`, `duration`, `travelers`, `travel_style`, `currency`, `total_estimate`, `breakdown` (jsonb), `notes` | Budget page |
| `chat_threads` | Conversation containers | `user_id`, `title` | Chat list |
| `chat_messages` | Messages in threads | `thread_id`, `user_id`, `role`, `content` | Chat conversation |

### RLS Policy Pattern
Every user-data table has a single `ALL` policy: `auth.uid() = user_id` (using and check). `profiles` uses `auth.uid() = id` and splits SELECT / INSERT / UPDATE (no DELETE).

### Database Functions
- `handle_new_user()` — trigger to create a `profiles` row from `auth.users` on signup
- `update_updated_at_column()` — generic `updated_at` touch trigger

---

## 6. Server Functions (`src/lib/*.functions.ts`)

All app-internal backend logic uses `createServerFn` from `@tanstack/react-start`. Each is guarded by `requireSupabaseAuth` and queries via the user-scoped Supabase client (RLS applies).

| Module | Exports | Description |
|--------|---------|-------------|
| `itineraries.functions.ts` | `generateItinerary`, `listItineraries`, `deleteItinerary` | Calls Lovable AI to build a multi-day plan; persists to `itineraries` |
| `budgets.functions.ts` | `generateBudget`, `listBudgets`, `deleteBudget` | AI-estimated cost breakdown; persists to `budgets` |
| `chat.functions.ts` | `listThreads`, `createThread`, `getThread`, `listMessages`, `sendMessage`, `deleteThread` | Thread + message CRUD |
| `favorites.functions.ts` | `listFavorites`, `addFavorite`, `removeFavorite` | Favorites CRUD |
| `recently.functions.ts` | `listRecent`, `trackView` | Recently-viewed tracking |
| `profile.functions.ts` | `getProfile`, `updateProfile` | Profile read/update |

### Public HTTP Endpoint
`src/routes/api/chat.ts` — streaming chat completion endpoint backed by the Lovable AI Gateway (consumed by the chat UI for token-by-token responses).

---

## 7. AI Integration

- **Gateway:** `src/lib/ai-gateway.server.ts` configures an OpenAI-compatible client pointing at the Lovable AI Gateway (`LOVABLE_API_KEY` secret, server-only)
- **Models:** Gemini family (default: `google/gemini-2.5-flash`)
- **Use cases:**
  - Itinerary generation (structured day-by-day text)
  - Budget estimation (structured breakdown + total)
  - Streaming chat replies via `ai` SDK (`streamText`)

---

## 8. Frontend Data Flow

Default read shape (canonical TanStack pattern):

```ts
const opts = queryOptions({ queryKey: [...], queryFn: () => serverFn() });

export const Route = createFileRoute("/_authenticated/favorites")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(opts);
}
```

Mutations use `useMutation` + `queryClient.invalidateQueries`. Toasts via `sonner`.

---

## 9. Styling & Design System

- Tailwind CSS v4 loaded through `@tailwindcss/vite`
- Theme tokens (colors, radii, fonts) declared in `src/styles.css` via `@theme`
- shadcn/ui components in `src/components/ui/` reference tokens (`bg-primary`, `text-foreground`, etc.) — no hardcoded color utilities
- Dark mode supported via CSS variable theming

---

## 10. Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Client | Project ref |
| `SUPABASE_URL` | Server | Same URL, server-side |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Same key, server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (secret) | Admin client (rarely used) |
| `LOVABLE_API_KEY` | Server (secret) | Lovable AI Gateway access |

---

## 11. Key Architectural Rules

- **No Edge Functions** — app-internal backend uses TanStack server functions, not `supabase/functions`
- **Loaders are isomorphic** — secrets and admin clients only inside `createServerFn` handlers
- **Public route loaders never call protected server fns** — would 401 during SSR
- **`supabaseAdmin` is rare** — default to `requireSupabaseAuth` + RLS for user data
- **Bearer attacher must stay in `src/start.ts`** — required for any server fn using `requireSupabaseAuth`
- **`src/routeTree.gen.ts` is auto-generated** — never edit by hand

---

## 12. Feature → Code Map

| Feature | UI Route | Server Logic | Tables |
|---------|----------|--------------|--------|
| Landing | `/` | — | — |
| Browse destinations | `/explore` | `destinations.ts` (static) | — |
| Destination detail | `/destination/$id` | `recently.functions.ts`, `favorites.functions.ts` | `recently_viewed`, `favorites` |
| Auth | `/auth`, `/reset-password` | Supabase Auth | `profiles` (via trigger) |
| Dashboard | `/dashboard` | `recently.functions.ts`, `favorites.functions.ts` | `recently_viewed`, `favorites` |
| Profile | `/profile` | `profile.functions.ts` | `profiles` |
| Favorites | `/favorites` | `favorites.functions.ts` | `favorites` |
| Itinerary Planner | `/itinerary` | `itineraries.functions.ts` + AI | `itineraries` |
| Budget Planner | `/budget` | `budgets.functions.ts` + AI | `budgets` |
| AI Chat | `/chat`, `/chat/$threadId`, `/api/chat` | `chat.functions.ts` + AI stream | `chat_threads`, `chat_messages` |

---

## 13. Build & Run

```bash
bun install
bun run dev       # vite dev server
bun run build     # production build
bun run lint
```

Dev server: `http://localhost:8080`. Production deploys to Cloudflare Workers via the Lovable platform.
