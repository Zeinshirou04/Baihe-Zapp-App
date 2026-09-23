# Baihe

Fan translation site for 百合 (GL) Chinese dramas — English translations per series → episode → line (with timestamp), shown in a bilingual hanzi / pinyin / English reader.

## Tech Stack

- **Next.js 15** (App Router, TypeScript, Server Components first)
- **Tailwind CSS v4** (CSS-first `@theme` in `globals.css`)
- **Prisma 7** + MariaDB (via `@prisma/adapter-mariadb`)
- **Auth**: credentials only, single admin, session cookie (no OAuth)
- **Icons**: Lucide React
- **Tests**: Vitest

## Project Structure

```
src/
├── actions/          # Server Actions (mutations)
├── app/              # Next.js App Router pages
│   ├── [locale]/     # Public pages (series, episodes, reader)
│   └── admin/        # Admin panel (series, episodes, line editor)
├── components/       # Shared UI components
├── data/             # Server-only data fetching (import 'server-only')
├── db/               # Prisma client singleton
├── generated/        # Prisma client output (gitignored)
└── middleware.ts     # Auth / locale handling
```

## Admin Features

- Series CRUD (poster upload, cast, status)
- Episode management (order, publish, duration)
- **Line Editor** — bulk-paste transcript, edit timestamps/hanzi/translation, pinyin generated on save
- Translation credits per episode (translator / editor / proofreader)

## Public Pages

1. **Series Grid** — poster-led browse
2. **Series Detail** — synopsis, cast, episode list with progress
3. **Episode Reader** — bilingual e-reader (hanzi / pinyin / English), pinyin toggle

## Deployment

Production: Debian 13, Nginx → PM2 → Next.js, exposed via Cloudflare Tunnel.

## License

MIT License — see [LICENSE](LICENSE) for details.

> **Note**: This license applies to the **codebase only**. Translations and series metadata are fan-contributed content; original audio dramas belong to their respective rights holders (Fanjiao / production companies).