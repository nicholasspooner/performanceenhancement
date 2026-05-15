# Nicholas Spooner Coaching & Advisory website

This package contains:

- `index.html` — the website
- `server.js` — the Node/Express backend that receives form submissions
- `package.json` — dependencies and start script
- `.env.example` — example environment variables

## Local setup

1. Install Node.js 18 or later.
2. In this folder, run:

```bash
npm install
```

3. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

4. Edit `.env` and set `SMTP_PASS`.

For Gmail, this should generally be a Gmail app password, not your normal Google account password.

5. Start the site:

```bash
npm start
```

6. Open:

```text
http://localhost:3000
```

## How the enquiry button works

The form in `index.html` sends a `POST` request to:

```text
/send-enquiry
```

The backend validates the required fields and uses Nodemailer to send the enquiry to:

```text
nicholasspooner@gmail.com
```

## Deployment note

This needs a Node-capable host, such as Render, Railway, Fly.io, DigitalOcean, or a VPS. A purely static host will display the website but will not run `server.js`.
