# Patamu Restaurant & Lodge

Nuxt 4 rebuild of the Patamu marketing site, preserving the existing visual system while improving crawlability and search metadata.

## Development

```bash
npm install
npm run dev
```

The app source lives under `src/`.

## Scripts

```bash
npm run dev
npm run build
npm run generate
npm run preview
npm run typecheck
```

## SEO Notes

- Canonical URLs and page metadata are defined per route.
- JSON-LD is rendered for the homepage and menu page.
- `robots.txt` and `sitemap.xml` are served from Nitro server routes.
- `NUXT_PUBLIC_SITE_URL` can be set for production canonical URLs.
