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

## Upload Steps

1. Upload the archive or the `release/patamurestaurants-cpanel/` folder contents.
2. In cPanel Application Manager, create a Node.js app that points to that folder.
3. Set the startup file to `app.js`.
4. Add environment variables if needed:
   - `NODE_ENV=production`
   - `NUXT_PUBLIC_SITE_URL=https://patamurestaurants.com`
   - `NUXT_PUBLIC_GA_ID=G-3FHWVHDTZC`
   - `NUXT_ALLOWED_ORIGINS=https://patamurestaurants.com`
   - `AUTH_SESSION_SECRET=replace-with-a-32-plus-character-random-secret`
   - `SECURITY_STRICT_BROWSER_HEADERS=false`
5. Restart the application.

The built app serves the prerendered public files from `.output/public` and
the Nitro server from `.output/server`.

`SECURITY_STRICT_BROWSER_HEADERS` is opt-in. Keeping it `false` matches the relaxed browser header profile that avoids breaking Nuxt hydration, Lenis smooth scrolling, and GSAP animations in hosted environments.
