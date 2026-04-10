# Champion Auto Finance Static Rebuild

This replaces the WordPress frontend with a static site and moves form delivery to a separate API endpoint.

## Why this fixes the original issues

- The homepage CTA now points to a real page instead of `#`.
- The public site no longer depends on WordPress, Gravity Forms, or WP Mail SMTP.
- Form secrets stay off the static host.
- Mail can be sent through Resend from a verified domain instead of failing through Gmail OAuth or raw SMTP.

## Project layout

- `index.html`: homepage
- `contact-us.html`: contact form
- `dealer-partners.html`: dealer partner form
- `styles.css`: shared styling
- `app.js`: frontend form submission logic
- `site-config.js`: local config file for the form endpoint
- `worker/`: Cloudflare Worker mail endpoint

## Fastest recommended deployment

### Frontend

Host the static files on one of these:

- GitHub Pages
- Cloudflare Pages
- Vercel static hosting

### Backend

Deploy the Worker in `worker/` and point `site-config.js` to:

```js
window.CAF_CONFIG = {
  formEndpoint: "https://your-worker.example.workers.dev/api/forms",
};
```

## Cloudflare Worker setup

1. Install Wrangler.
2. In `worker/wrangler.toml`, set:
   - `ALLOWED_ORIGIN`
   - `NOTIFY_TO_EMAIL`
   - `NOTIFY_FROM_EMAIL`
3. Add the secret:

```bash
cd worker
npx wrangler secret put RESEND_API_KEY
```

4. Deploy:

```bash
cd worker
npx wrangler deploy
```

5. Copy the deployed Worker URL into `site-config.js`.

## Resend requirements

You still need a verified sending domain in Resend.

Recommended:

- verify a domain you control, for example `mail.yourdomain.com`
- set `NOTIFY_FROM_EMAIL` to an address on that verified domain
- set `NOTIFY_TO_EMAIL` to `info@championautofinance.com` or another inbox you monitor

## GitHub Pages option

GitHub Pages can host the static files, but it cannot safely store your Resend API key.

Use:

- GitHub Pages for the frontend
- Cloudflare Worker for `/api/forms`

That is the cleanest free/low-cost split.

## Vercel option

You can also host both frontend and backend on Vercel. The frontend files can stay unchanged. You would replace the Worker with a Vercel serverless function and keep the same frontend form endpoint pattern.

## Lowest-friction production recommendation

- Frontend: Cloudflare Pages
- Forms/API: Cloudflare Worker
- Email: Resend

That avoids WordPress mail issues and keeps the stack simple.
