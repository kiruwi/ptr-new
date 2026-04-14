# Patamu Restaurant & Lodge

## Requirements

- Node.js `20.19.0+` or `22.12.0+`
- npm `10+`

## Environment

Copy `.env.example` to `.env` if you want local overrides.

```bash
cp .env.example .env
```

Available variables:

- `NUXT_PUBLIC_SITE_URL` sets the public site URL used for canonical tags, `robots.txt`, and `sitemap.xml`.
- `NUXT_PUBLIC_GA_ID` enables Google Analytics when set to a valid `G-XXXXXXXXXX` measurement ID. Production defaults to a placeholder fake value in docs.
- `NUXT_PUBLIC_GTM_ID` enables the Google Tag Manager container when set to a valid `GTM-XXXXXXX` ID.
- `NUXT_ALLOWED_ORIGINS` is a comma-separated allowlist for cross-origin API access.
- `AUTH_SESSION_SECRET` is required before enabling any cookie-backed auth routes.
- `ADMIN_USER_IDS` can be used by future admin-only routes as an explicit allowlist.
- `SECURITY_STRICT_BROWSER_HEADERS=true` opts production into CSP and browser isolation headers. It stays `false` by default so Nuxt hydration, Lenis, and GSAP are not blocked in hosted environments.

If you do not set them, the app falls back to the defaults in `nuxt.config.ts`, except analytics which stays off by default.

## Local Development

```bash
npm install
npm run dev
```

The local dev server runs on `http://localhost:3000` by default.

The app source lives under `src/`.

## Scripts

```bash
npm run dev
npm run build
npm run generate
npm run preview
npm run typecheck
npm run test:security
npm run security:sast
npm run security:deps
npm run ci:security
npm run start
npm run package:cpanel
npm run deploy:sftp
```

## Security Baseline

- Production responses always ship transport security, anti-clickjacking, and referrer/permissions headers. CSP and browser isolation headers are opt-in through `SECURITY_STRICT_BROWSER_HEADERS=true`.
- `/api/admin/**`, `/api/account/**`, `/api/internal/**`, and `/api/users/:id/**` are deny-by-default in middleware and require centralized authz and ownership checks before route handlers execute.
- Cookie-authenticated mutating API routes require CSRF tokens.
- Password helpers use Argon2id, reset tokens are opaque and hashed, webhook signatures use HMAC-SHA256, and server-side URL fetching is limited to an explicit allowlist helper that blocks private IP space.
- Security regressions are enforced by runtime tests, static policy checks, `npm audit`, Semgrep, and Gitleaks.

## SEO Notes

- Canonical URLs and page metadata are defined per route.
- JSON-LD is rendered for the homepage and menu page.
- `robots.txt` and `sitemap.xml` are served from Nitro server routes.
- `NUXT_PUBLIC_SITE_URL` can be set for production canonical URLs.

## cPanel Deployment

This repo includes a cPanel-compatible startup file at `app.js`.

To create the final upload bundle:

```bash
npm install
npm run package:cpanel
```

That command:

- builds the Nuxt app into `.output/`
- creates `release/patamurestaurants-cpanel/`
- creates `release/patamurestaurants-cpanel.zip` when `zip` is available
- falls back to `release/patamurestaurants-cpanel.tar.gz` when `zip` is unavailable
- writes `release/patamurestaurants-cpanel/.env.production.example` with production-safe defaults for cPanel

For cPanel Application Manager:

1. Upload the generated bundle.
2. Set the application root to the extracted bundle folder.
3. Set the startup file to `app.js`.
4. Set `NODE_ENV=production`.
5. Set `NUXT_PUBLIC_SITE_URL=https://example.invalid`.
6. Set `NUXT_PUBLIC_GA_ID=G-FAKE123456` unless you intentionally want a different production measurement ID.
7. Set `NUXT_PUBLIC_GTM_ID=GTM-TCS6X8R9` unless you intentionally want a different Tag Manager container.
8. Set `NUXT_ALLOWED_ORIGINS=https://example.invalid` unless a different trusted origin must call `/api/*`.
9. Set `AUTH_SESSION_SECRET` before deploying any authenticated API routes.
10. Leave `SECURITY_STRICT_BROWSER_HEADERS=false` unless you have explicitly verified that stricter CSP/browser isolation does not break the hosted frontend.

More deployment detail is in `CPANEL.md`.

## Static SFTP Deploy

For static hosting on cPanel via `public_html`, this repo also includes an SFTP deploy script:

```bash
npm run generate
DEPLOY_SFTP_HOST=example.com \
DEPLOY_SFTP_USER=example-user \
DEPLOY_SFTP_REMOTE_ROOT=public_html \
npm run deploy:sftp
```

Optional variables:

- `DEPLOY_SFTP_PORT=22`
- `DEPLOY_SFTP_LOCAL_ROOT=.output/public`
- `DEPLOY_SFTP_IDENTITY_FILE=/path/to/private_key`
- `DEPLOY_SFTP_PASSWORD=...` only when `sshpass` is installed locally
- `DEPLOY_SFTP_STRICT_HOST_KEY_CHECKING=accept-new`

Behavior:

- uploads the current static build from `.output/public`
- uploads `index.html` and `menu/index.html` last to reduce inconsistent deploy windows
- removes stale remote site files when SSH shell access is available
- preserves `.well-known` and `.htaccess*` in the remote web root

Flags:

- `npm run deploy:sftp -- --dry-run` prints the generated SFTP batch without uploading
- `npm run deploy:sftp -- --no-clean` uploads only and skips stale-file cleanup

Prefer SSH key auth over password auth. If your host has SFTP disabled, enable SSH access in cPanel first.
