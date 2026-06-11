# ApplyWise

A Progressive Web App (PWA) that helps South African Grade 12 learners apply to multiple universities at once using a single form.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend/Auth**: Supabase
- **Forms**: react-hook-form + zod
- **State**: zustand
- **Notifications**: react-hot-toast
- **Icons**: lucide-react
- **PWA**: next-pwa

## Project Structure

```
applywise/
├── app/
│   ├── (auth)/               # Auth route group (no shared layout with dashboard)
│   │   ├── login/            # /login
│   │   └── signup/           # /signup
│   ├── (dashboard)/          # Protected route group
│   │   ├── dashboard/        # /dashboard — application overview
│   │   ├── profile/          # /profile — personal info
│   │   ├── universities/     # /universities — browse & select universities
│   │   └── notifications/    # /notifications — alerts & updates
│   └── api/                  # API route handlers
├── components/
│   ├── ui/                   # Reusable UI primitives (buttons, inputs, cards)
│   ├── forms/                # Form components built with react-hook-form
│   └── layout/               # Navbar, sidebar, footer, page shells
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   ├── server.ts         # Server Component Supabase client
│   │   └── middleware.ts     # Session refresh helper for middleware
│   ├── validations/          # Zod schemas (auth.ts, profile.ts, etc.)
│   └── utils/                # Shared utility functions
├── public/
│   ├── manifest.json         # PWA manifest
│   └── icons/                # App icons (72–512px)
├── types/
│   └── index.ts              # Shared TypeScript interfaces
├── middleware.ts              # Supabase session middleware
└── .env.local                # Environment variables (never commit)
```

## Brand Colours

| Token            | Hex       | Usage                      |
|------------------|-----------|----------------------------|
| `--color-navy`   | `#0b4f6c` | Primary / headings / CTAs  |
| `--color-green`  | `#1ec97e` | Success / active states    |
| `--color-amber`  | `#f5a623` | Warnings / pending         |
| `--color-red`    | `#e63946` | Errors / rejected           |

Use them in Tailwind via arbitrary values: `text-[var(--color-navy)]`, or extend `tailwind.config.ts`.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables** — fill in `.env.local` with your Supabase project credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## PWA Notes

- The service worker is **disabled in development** and only active in production builds.
- Run `npm run build && npm start` to test PWA functionality locally.
- Add app icons (PNG) to `public/icons/` at the sizes listed in `public/manifest.json`.

## Environment Variables

| Variable                        | Description                              |
|---------------------------------|------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server only)  |
| `PAYFAST_MERCHANT_ID`           | PayFast merchant ID                      |
| `PAYFAST_MERCHANT_KEY`          | PayFast merchant key                     |
| `PAYFAST_PASSPHRASE`            | PayFast passphrase                       |
