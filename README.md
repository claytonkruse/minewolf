<p align="center">
    <img src="src/lib/assets/logo-large.png" alt="Minewolf" width="420" />
</p>

<p align="center">
    A Minecraft server list that keeps itself up to date.
</p>

<p align="center">
    <a href="https://minewolf.net"><strong>minewolf.net</strong></a>
</p>

---

Minewolf is a server list for Minecraft: Java Edition. Server owners sign in with Discord, enter an address, and Minewolf fills in the rest by pinging the server directly. After that, every listing is re-pinged every 10 minutes, so online status, player counts, MOTDs and icons always reflect the server as it is right now.

It's built with SvelteKit (Svelte 5), PostgreSQL via Drizzle ORM, Tailwind CSS v4 and shadcn-svelte, and ships as a single Docker image.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Database and migrations](#database-and-migrations)
- [Administration](#administration)
- [Deployment](#deployment)
- [Testing and code quality](#testing-and-code-quality)

## Features

### For players

- **Browse and search.** The home page and `/servers/` list every server, sponsors first, then by rank. Search matches name, public address, tags and description, with exact and prefix name matches ranked highest. Tag links filter the list to servers sharing that tag. The `/servers/` search page also filters by tag, supported version (including proxy version ranges like `1.7.2-26.3`), online status, crossplay and whitelist, and sorts by relevance, rank, players, uptime, newest or name. A Random Server button on the home page and search page opens a random online server.
- **Live server pages.** Each server has its own page with its banner, colored MOTD, current player count, version, tags, description, an embedded YouTube video, website and Discord links, and a "similar servers" panel based on shared tags.
- **Live maps.** Servers that publish a web map (Dynmap, BlueMap, etc.) get an embedded map page at `/servers/<id>/map/`.
- **Voting.** Players can vote once every 24 hours, protected by Cloudflare Turnstile. Servers running [Votifier](https://github.com/NuVotifier/NuVotifier) receive the vote in-game so they can hand out rewards.
- **Forum.** A built-in forum with categories for general chat, server ads, Bedrock and modded servers, Realms, builds, LFG, server owners and recruiting. Threads support Markdown, pagination, pinning, locking, editing and view counts.

### For server owners

- **Free listing via Discord login.** Adding a server only requires the address; Minewolf verifies it's reachable and pulls the MOTD, icon and version automatically.
- **Dashboard.** Owners can edit their listing (name, description, tags, banner, links, Votifier settings, Bedrock/crossplay info), hide the address, or remove the server.
- **Banner uploads.** Uploaded banners are converted to WebP with `sharp` and served from `/servers/<id>/banner.webp`.
- **Analytics.** A 30-day chart per server showing votes, listing impressions and page views.
- **Discord notifications.** An optional bot posts an embed to a channel whenever a server is added or receives a vote.

### For the site

- **SEO.** Canonical URLs, Open Graph tags, JSON-LD structured data, `robots.txt` and a generated `sitemap.xml`.
- **Admin tools.** Admins manage the ordered list of sponsored servers from the dashboard.
- **Bot-aware analytics.** Crawlers, previews and headless browsers are excluded from view counts.

## Tech stack

| Area            | Tools                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Framework       | [SvelteKit 2](https://kit.svelte.dev) + Svelte 5, `adapter-node`      |
| Language        | TypeScript                                                            |
| Database        | PostgreSQL, [Drizzle ORM](https://orm.drizzle.team) + drizzle-kit     |
| UI              | Tailwind CSS v4, [shadcn-svelte](https://shadcn-svelte.com), bits-ui  |
| Forms           | sveltekit-superforms, formsnap, zod                                   |
| Charts          | LayerChart                                                            |
| Auth            | Discord OAuth2 via [Arctic](https://arcticjs.dev), session cookies    |
| Anti-spam       | Cloudflare Turnstile                                                  |
| Markdown        | marked + DOMPurify / sanitize-html                                    |
| Images          | sharp                                                                 |
| Icons           | Lucide, unplugin-icons (Iconify)                                      |
| Tooling         | pnpm, Vite, Vitest, Playwright, ESLint, Prettier                      |

## Getting started

### Prerequisites

- Node.js 22+
- pnpm (the version is pinned in `package.json`; `corepack enable` will pick it up)
- Docker, for the local PostgreSQL database
- A Discord application (for login) and a Cloudflare Turnstile site (for CAPTCHA)

### 1. Install dependencies

```sh
pnpm install
```

### 2. Start a database

`docker-compose.yaml` runs a throwaway Postgres for development on `localhost:5432` with user, password and database all set to `postgres`:

```sh
docker compose up -d
```

If `DB_URL` is unset, the app, the ping script and drizzle-kit all fall back to that address.

### 3. Configure the environment

```sh
cp .env.example .env
```

Fill in the values described under [Configuration](#configuration). For local development, set the Discord redirect URI to `http://localhost:5173/login/` and add it to your Discord app's OAuth2 redirects. Cloudflare publishes [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for Turnstile that always pass.

### 4. Run migrations

```sh
pnpm migrate
```

### 5. Start the dev server

```sh
pnpm dev
```

The site is now at http://localhost:5173.

Server stats are only refreshed by the ping script, so to populate them locally run it by hand:

```sh
pnpm ping-servers
```

## Configuration

All configuration is through environment variables. Most are imported with `$env/static`, which means they're baked in at **build time**: changing them requires a rebuild, not just a restart.

| Variable                               | Required | Description                                                                                  |
| -------------------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `DB_URL`                               | Yes\*    | Postgres connection string. Defaults to `postgres://postgres:postgres@localhost:5432/postgres`. |
| `POSTGRES_PASSWORD`                    | Prod     | Used by the production compose setup to build `DB_URL`.                                       |
| `PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | Yes      | Turnstile site key, used on the add-server and vote forms.                                    |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY`      | Yes      | Turnstile secret, used to verify tokens server side.                                          |
| `PUBLIC_DISCORD_INVITE`                | Yes      | Invite link to the Minewolf Discord shown on the site.                                        |
| `PUBLIC_DISCORD_CLIENT_ID`             | Yes      | Discord OAuth2 client ID.                                                                     |
| `DISCORD_CLIENT_SECRET`                | Yes      | Discord OAuth2 client secret.                                                                 |
| `PUBLIC_DISCORD_OAUTH_REDIRECT_URI`    | Yes      | Must point at `/login/` on your origin and be registered in the Discord app.                  |
| `DISCORD_BOT_TOKEN`                    | No       | Bot token for new-server and vote notifications. Leave blank to disable.                      |
| `DISCORD_NOTIFY_CHANNEL_ID`            | No       | Channel the bot posts to. The bot needs Send Messages and Embed Links.                        |

The Docker image additionally reads `PORT` (default `3000`), `BODY_SIZE_LIMIT` (default `4M`, which caps banner uploads) and the client-IP header used by `adapter-node`.

The public site origin used for canonical URLs, Open Graph tags and the sitemap is fixed to `https://minewolf.net` in `src/lib/config.ts`, so every environment points search engines at production.

## Scripts

| Command                 | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `pnpm dev`              | Start the Vite dev server                                |
| `pnpm build`            | Production build into `build/`                           |
| `pnpm preview`          | Preview the production build                             |
| `pnpm check`            | Type-check with `svelte-check`                           |
| `pnpm lint`             | Prettier check + ESLint                                  |
| `pnpm format`           | Format everything with Prettier                          |
| `pnpm test:unit`        | Run Vitest                                               |
| `pnpm test:integration` | Run Playwright against a preview build                   |
| `pnpm generate`         | Generate a migration from schema changes                 |
| `pnpm migrate`          | Apply pending migrations                                 |
| `pnpm studio`           | Open Drizzle Studio to browse the database               |
| `pnpm ping-servers`     | Ping every listed server once and store the results      |

## Project structure

```
minewolf/
├── docker/                    # crontab + entrypoint for the production image
├── drizzle/                   # generated SQL migrations and snapshots
├── scripts/
│   └── ping-servers.ts        # cron job: refresh every server's status
├── src/
│   ├── hooks.server.ts        # loads the session on every request
│   ├── lib/
│   │   ├── components/        # app components (ServerList, Seo, Banner, ...)
│   │   │   └── ui/            # shadcn-svelte components
│   │   ├── config.ts          # site name and public URL
│   │   ├── forum.ts           # forum categories and post/thread schemas
│   │   ├── public-zod-schemas/# validation shared by client and server
│   │   ├── server/
│   │   │   ├── db/drizzle/    # Drizzle client and schema
│   │   │   ├── pingServer/    # Server List Ping client + MOTD parser
│   │   │   ├── analytics.ts   # daily view counters and 30-day stats
│   │   │   ├── discordNotify.ts
│   │   │   ├── searchServers.ts
│   │   │   ├── session.ts     # session creation and validation
│   │   │   └── sponsors.ts
│   │   └── utils/
│   └── routes/
│       ├── (content)/         # all user-facing pages
│       │   ├── servers/       # list, server page, vote, map, banner
│       │   ├── add-server/
│       │   ├── dashboard/     # owner dashboard, analytics, admin
│       │   ├── forum/
│       │   └── login/ logout/ about/ premium/ sponsor/ discord/
│       ├── api/               # view-tracking endpoints
│       ├── robots.txt/
│       └── sitemap.xml/
├── static/                    # favicons, manifest, default banners
└── storage/                   # runtime data (uploaded banners); a volume in Docker
```

## How it works

### Server pinging

Minewolf implements the Java Edition [Server List Ping](https://minecraft.wiki/w/Java_Edition_protocol/Server_List_Ping) protocol itself in `src/lib/server/pingServer/`, without a third-party ping library. It:

- resolves `_minecraft._tcp` SRV records when no port is given, so addresses like `2b2t.org` work,
- times out after 5 seconds and rejects responses over 1 MB,
- parses the MOTD (both legacy `§` codes and JSON chat components) into plain text and colored HTML.

When a server is added, it's pinged once to confirm it's reachable. After that, `scripts/ping-servers.ts` refreshes every server. In Docker it runs from cron every 10 minutes, guarded by `flock` so runs never overlap. Offline servers keep their last MOTD and icon but report zero players. Each ping also adds to that day's counters in `server_uptime`. Uptime is online pings divided by total pings over the last 30 days, shown in the status tooltip on server lists and charted daily on server pages. MOTD HTML is sanitized down to `<span style>` and `<br>` before it's stored.

The ping script runs outside SvelteKit, so it can't use `$lib` or `$env` imports. It reads `DB_URL` from the environment directly.

Only Java Edition servers are pinged. Bedrock address and port fields are stored and displayed but not checked.

### Ordering

Lists show sponsored servers first (ordered by `sponsor_position`), then servers by `rank` ascending, then by name. A `rank` of `0` means unranked, and those servers sort last.

### Voting and Votifier

A vote records the voter's IP and Minecraft username. A new vote is rejected if, in the last 24 hours, the same IP voted for any server, or the same username voted for this server. The username-per-server rule stops someone from burning another player's daily vote on an arbitrary server.

If the server has Votifier enabled, Minewolf sends a classic (v1, RSA) Votifier packet to `votifier_address:votifier_port` (falling back to the server address and port `8192`) using the owner's public key.

### Authentication

Login is Discord-only, via OAuth2 with Arctic. The user's Discord ID, name and email are stored, along with a session row holding the Discord tokens. `hooks.server.ts` validates the session cookie on every request and exposes `locals.user` and `locals.session`. Users can log out of one device or all of them, and can delete their account, which cascades to their servers, votes, sessions and forum posts.

### Analytics

The client reports which servers appeared in a list (`listing`) and which server pages were opened (`page`) to `/api/views/`. Counts are stored as one row per server, kind and day, and incremented with an upsert. Requests from bots are ignored. The dashboard combines these with vote counts for a 30-day chart.

## Database and migrations

The schema lives in `src/lib/server/db/drizzle/schema.ts`. Main tables:

| Table           | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `user`          | Discord-linked accounts                                       |
| `user_role`     | Roles per user (currently just `admin`)                       |
| `session`       | Login sessions and Discord tokens                             |
| `server`        | Listings: address, ping results, owner settings, sponsor slot |
| `vote`          | Votes with IP, username and timestamp                         |
| `server_view`   | Daily listing/page view counters                              |
| `server_uptime` | Daily ping counts per server, used for uptime                 |
| `forum_thread`  | Threads with category slug, pin/lock flags and views          |
| `forum_post`    | Posts; the first post in a thread is its opening post         |

To change the schema:

1. Edit `schema.ts`.
2. Run `pnpm generate` to create a migration in `drizzle/`.
3. Review the SQL, then run `pnpm migrate`.
4. Commit both the schema change and the generated migration.

Forum categories are defined in code in `src/lib/forum.ts`, not in the database. Threads store the category slug, so renaming a slug orphans its threads.

## Administration

There's no UI for granting roles. To make a user an admin, add a row to `user_role`:

```sql
INSERT INTO user_role (user_id, role)
SELECT id, 'admin' FROM "user" WHERE discord_id = '<discord user id>';
```

Admins get an admin section in the dashboard for adding, removing and reordering sponsored servers. New roles are added to `roleEnum` in the schema, followed by `pnpm generate`.

The forum rules panel on the forum home page shows the thread whose ID is `FORUM_RULES_THREAD_ID` in `src/lib/forum.ts`.

## Deployment

The `Dockerfile` builds a self-contained production image:

1. Installs dependencies with pnpm and runs `pnpm build`.
2. Installs `docker/crontab`, which runs the ping script every 10 minutes.
3. On start, `docker/entrypoint.sh` snapshots the container environment for cron (cron jobs don't inherit it), starts `crond`, then runs `node build`.

```sh
docker build \
    --build-arg DB_URL=postgres://... \
    --build-arg PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=... \
    --build-arg CLOUDFLARE_TURNSTILE_SECRET_KEY=... \
    --build-arg PUBLIC_DISCORD_INVITE=... \
    --build-arg PUBLIC_DISCORD_CLIENT_ID=... \
    --build-arg DISCORD_CLIENT_SECRET=... \
    --build-arg PUBLIC_DISCORD_OAUTH_REDIRECT_URI=https://your.domain/login/ \
    -t minewolf .

docker run -d -p 3000:3000 -v minewolf-storage:/app/storage minewolf
```

Things to keep in mind:

- Environment variables are build args because they're read at build time. Rebuild after changing them.
- Mount a volume at `/app/storage` so uploaded banners survive container rebuilds.
- Run `pnpm migrate` against the production database before deploying a release that includes new migrations.
- Put the app behind a reverse proxy that sets `X-Forwarded-For`. Vote limits are per IP, so the real client address must reach the app.
- The `docker-compose.yaml` in this repo is only for the development database, not production.

## Testing and code quality

```sh
pnpm check      # type-check
pnpm lint       # prettier + eslint
pnpm test:unit  # vitest
```

Unit tests live next to the code as `*.test.ts` under `src/`. The most meaningful suite is `src/lib/server/pingServer/pingServer.test.ts`, which covers the VarInt encoding and MOTD parsing. Test coverage is otherwise light, and the Playwright integration setup (`playwright.config.ts`, `tests/`) has no real tests yet.

Code is formatted with Prettier (4-space indent, with the Svelte and Tailwind plugins). Run `pnpm format` before committing.
