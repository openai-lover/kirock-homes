# Vercel deployment

This adapter was implemented by Codex; it is not a new Kiro execution record.

- Target: `teamstartup`, Hobby; Node 24 LTS; region `iad1`.
- Database: dedicated `kirock-homes` Turso libSQL database, Starter ($0/month), US East. The owner explicitly prohibits payment cards, payments, upgrades and overages; do not enable them.
- Set server-only `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` using the Vercel storage integration. Set a random `CRON_SECRET` of at least 32 characters. Do not commit secrets or copy local Kiro credentials.
- Public URL: https://kirock-homes.vercel.app. HTTPS origin and secure cookies were verified using the incoming host. Set `APP_ORIGIN` only if a reverse proxy requires an explicit canonical origin. `AI_PROVIDER` and `CHAT_PROVIDER` are both `none` on this deployment. Public chat uses authored replies. Contest credits and a developer Kiro login are not a public inference service.
- The cloud adapter freezes all ten translations and the private solution. It uses remote-primary write transactions for creating sessions, ownership-checked deletion and the first accusation. Different server instances return the same recorded verdict.
- Links are denied by every read/play/accusation endpoint exactly seven days after creation. Owner deletion removes live case/photo/play rows immediately. The Hobby daily cron removes expired rows; new shares also trigger cleanup. The daily job has Vercel's ±59-minute scheduling precision. Service outages may delay physical cleanup; expiry access checks do not depend on cron. Provider backups and copies made by recipients follow their own retention; live-row deletion cannot recall those copies.
- `/api/maintenance/cleanup` requires `Authorization: Bearer <CRON_SECRET>` and fails closed without it. Monitor cron failures in Vercel. The local adapter retains its startup/hourly cleanup behavior.
- Source packaging includes `vercel.json` and `.vercelignore`. The cloud package does not include demo videos, verification screenshots, private runtime data or local credentials.

## Verification status

The new adapter is exercised against actual libSQL using independent clients, frozen translations, private response allow-lists, ownership, repeated accusation, expiry, deletion and AI request caps. Anonymous HTTPS checks against Vercel and remote Turso also passed, including concurrent accusation and expiry. See [production validation](production-validation.md). Production builds use `next build --webpack`; Next 16.4.3 Turbopack produced incomplete runtime traces on Vercel, which failed the initial production smoke tests. The final Webpack deployment passed them.

References: [Vercel SQLite](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel), [Turso Vercel integration](https://docs.turso.tech/integrations/vercel), [Vercel Hobby cron](https://vercel.com/docs/cron-jobs/usage-and-pricing).
