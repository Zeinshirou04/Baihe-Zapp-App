# Baihe

Fan translation site for 百合 (GL) Chinese dramas: English translations per
series → episode → line (with timestamp), shown in a bilingual hanzi / pinyin /
English reader. Solo project by Zayn. Public site, single admin (Zayn).

Product scope: `docs/product.md`. Schema: `docs/erd.md`.

## Stack

- **One full-stack Next.js app** (App Router, TypeScript). No separate API
  server, no Laravel.
- Tailwind CSS v4 (CSS-first `@theme` in `globals.css`; there is NO
  `tailwind.config.js`).
- MySQL/MariaDB via Prisma. Do not mix in another ORM.
- Auth: credentials only, single admin, session cookie. No OAuth (the
  production server has no outbound access).
- Lucide icons. Tests with Vitest.
- Prod: Debian 13, Nginx → PM2 → Next.js, exposed via Cloudflare Tunnel.

## Environment (read this before running any command)

- **Dev is Windows, shell is PowerShell 7 (`pwsh`).** Prod is Debian 13 (bash)
  on Zayn's home server. Never write bash-only commands for local use:
  no `rm -rf`, `export`, `cat`, `grep`, `sed`, heredocs, or `&&` chains.
  Use PowerShell (`Remove-Item`, `$env:VAR = "x"`, `;`) or a Node script.
- Prefer the built-in Read / Write / Edit / Glob / Grep tools over the shell
  for file work.
- `package.json` scripts must be cross-platform: use `cross-env` and
  `rimraf`, never `export` or `rm -rf`.
- Build paths with `path.join` / `path.resolve`; never hardcode `\` or `/`.
  `UPLOADS_DIR` differs per OS (a Windows folder in dev, `/var/...` in prod).
- **Case sensitivity:** Windows ignores filename case, Debian does not. Import
  paths and filenames must match exact case, or the build only breaks on prod.
- **Line endings:** LF everywhere (`.gitattributes` with `* text=auto eol=lf`,
  Prettier `endOfLine: "lf"`).
- Keep the Node version in `.nvmrc` / `engines` matching the server.
- Production commands (Debian, Nginx, PM2, `prisma migrate deploy`) are run by
  Zayn on the server, never by you.

## Commands

- `npm run dev` / `npm run build` / `npm run lint` / `npm test`
- `npx prisma migrate dev` (dev DB only)

## Architecture rules

- **Reads:** Server Components call functions in `src/data/` (each file starts
  with `import 'server-only'`). Never fetch your own API from the server.
- **Writes:** Server Actions in `src/actions/`. Validate input with Zod, check
  the admin session, then call `revalidatePath` / `revalidateTag`.
- **Route Handlers** only where real HTTP is needed (uploads, health check).
- Database access lives in `src/db`, `src/data`, `src/actions` only.
- `'use client'` only when needed (e.g. the pinyin toggle). Default to Server
  Components.
- Next.js 15+: `params` and `searchParams` are Promises, await them.
- Pages without `revalidate` or tags are static. Public pages must be
  revalidated from the admin actions that change their data.
- Pinyin is generated at save time and stored, not computed on every read.

## Files, fonts, env

- Uploads go to the directory in `UPLOADS_DIR` (outside the repo and `.next`),
  served by Nginx at `/media/` in prod. In dev a route handler at
  `/media/[...path]` serves the same folder and returns 404 when
  `NODE_ENV=production`. Never write into `public/` at runtime.
- Fonts: `next/font/local` only. next/font CSS variables must be named
  differently from theme tokens (`--nf-body`, not `--font-body`). Never define
  `--font-sans`.
- Tailwind v4 needs an explicit `@source` in `globals.css` if classes are not
  picked up.
- Secrets never use `NEXT_PUBLIC_`. `.env.local` is gitignored; keep
  `.env.example` current.
- Put `suppressHydrationWarning` on `<body>` (browser extensions inject
  attributes).

## Content rules

- No lorem ipsum, no invented series data, no invented translation lines. Use
  real data or ask Zayn for it. Empty and partial states are designed on
  purpose (see the baihe-ui skill §10).
- Schema changes: propose in plan mode first, wait for approval, update
  `docs/erd.md` in the same change.

## UI work (mandatory)
Before writing or editing ANY JSX, Tailwind classes, or layout, including
everything under /admin, call the `skill` tool with name `baihe-ui` and follow it.
For /admin, also follow the "Admin UI" section of that skill.

- Only use Baihe tokens: ink, ink-raised, porcelain, paper, brass, plum.
- Never use default palette colors (gray-*, blue-*, bg-white, text-black).
- If the skill can't be loaded, stop and tell me. Don't improvise a style.

## Git

- **Load the `github-workflow` skill for any commit, branch, PR or merge.**
- Conventional commits, split by concern, stage files explicitly (no
  `git add .`). Work on `dev`; larger or schema changes on dated feature
  branches. Never commit to `main`.
- PR descriptions are written as a `.md` file in `.pr/`, not pasted in chat.

## Boundaries

- You run on Zayn's dev machine only. Never touch the production server,
  production DB or production env. Prod migrations (`prisma migrate deploy`)
  are run manually by Zayn.
- Never read or print `.env*` files (except `.env.example`).
- Never guess a library API from memory. For Next.js, Prisma, Tailwind v4 and
  the auth library, check the installed version in `package.json` and the
  library's docs or `node_modules` source before writing code.

## Working style

- Small vertical slices. For anything touching schema, auth, or more than 3
  files: state a plan and wait for approval before editing.
- Be terse. Zayn is a full-stack developer (Laravel, React, REST APIs); skip
  basics. Reply in the language he writes in.

## Prisma 7 (pinned)
- Project uses Prisma ORM 7 with MariaDB. Prisma 8 does NOT support MySQL/MariaDB yet.
- Never run `npx prisma@latest`, `npm i prisma@latest`, `prisma orm init`, or follow Prisma 8 / prisma-8 docs. Docs: docs.prisma.io/docs/orm/v7
- Keep `prisma` and `@prisma/client` on ^7. Config in `prisma.config.ts` (defineConfig from "prisma/config"), datasource URL from `.env.local`; no `url` in schema.prisma.
- Generator `prisma-client`, output `src/generated/prisma` (gitignored), import from `@/generated/prisma/client`. Driver adapter `@prisma/adapter-mariadb` required. One shared client in `src/db/client.ts`.
- Run `npx prisma generate` after every schema change.

