# cPanel Deployment

This project can be deployed to cPanel as a Node.js application with
Application Manager / Passenger.

## Requirements

- Node.js `20.19.0+` or `22.12.0+`
- Startup file: `app.js`

## Bundle Workflow

Run this from the project root:

```bash
npm install
npm run package:cpanel
```

This creates:

- `release/patamurestaurants-cpanel/`
- `release/patamurestaurants-cpanel.zip` when `zip` is available
- `release/patamurestaurants-cpanel.tar.gz` when `zip` is unavailable but `tar` is available
- `release/patamurestaurants-cpanel/.env.production.example` with the production env values the hosted app expects

## Static Site Over SFTP

If the site is being served directly from `public_html` instead of cPanel's Node.js Application Manager, deploy the prerendered static output over SFTP:

```bash
npm run generate
DEPLOY_SFTP_HOST=example.com \
DEPLOY_SFTP_USER=example-user \
DEPLOY_SFTP_REMOTE_ROOT=public_html \
npm run deploy:sftp
```

Recommended auth:

- use an SSH key and set `DEPLOY_SFTP_IDENTITY_FILE=/path/to/private_key`
- avoid plain FTP for routine deploys
- avoid password auth unless the host does not support keys

Optional flags:

- `npm run deploy:sftp -- --dry-run`
- `npm run deploy:sftp -- --no-clean`

The SFTP deploy script preserves `.well-known` and `.htaccess*`, uploads `index.html` last, and removes stale site files when remote SSH shell access is available.

## Upload Steps

1. Upload the archive or the `release/patamurestaurants-cpanel/` folder contents.
2. In cPanel Application Manager, create a Node.js app that points to that folder.
3. Set the startup file to `app.js`.
4. Add environment variables if needed:
   - `NODE_ENV=production`
   - `NUXT_PUBLIC_SITE_URL=https://example.invalid`
   - `NUXT_PUBLIC_GA_ID=G-FAKE123456`
   - `NUXT_PUBLIC_GTM_ID=GTM-TCS6X8R9`
   - `NUXT_ALLOWED_ORIGINS=https://example.invalid`
   - `AUTH_SESSION_SECRET=replace-with-a-random-32-plus-character-secret`
   - `SECURITY_STRICT_BROWSER_HEADERS=false`
5. Restart the application.

The built app serves the prerendered public files from `.output/public` and
the Nitro server from `.output/server`.

`SECURITY_STRICT_BROWSER_HEADERS` is opt-in. Keeping it `false` matches the relaxed browser header profile that avoids breaking Nuxt hydration, Lenis smooth scrolling, and GSAP animations in hosted environments.
