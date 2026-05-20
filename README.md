# SpiceVeg Agri Seeds - Modern Cloudflare Stack

A production-grade, full-stack architecture optimized for Cloudflare Edge infrastructure.

## 🏗️ Architecture

- **Monorepo:** Managed with `pnpm` and `Turborepo`.
- **Marketing site (`apps/web`):** Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion → `spiceveg.in`.
- **Customer + admin SPA (`apps/verify`):** Vanilla JS single-file app, talks directly to Firestore REST → `verify.spiceveg.in`. **Single source of truth** for the verification flow.
- **Backend (`apps/worker`):** Cloudflare Workers using the Hono framework → `api.spiceveg.in` (API) and `s.spiceveg.in` (URL shortener).
- **Admin (`apps/admin`):** Next.js admin panel (alternate UI; `apps/verify` is the canonical admin surface today).
- **UI Components (`packages/ui`):** Shared React components (Ready for shadcn/ui).
- **Database:** Cloudflare D1 (SQL) + Firestore (used by `apps/verify` for `seed_labels`).
- **Storage:** Cloudflare R2 (Object Storage).
- **Caching:** Cloudflare KV (Key-Value, used for short-link metadata).

## 🚚 Deployment Pipeline

| Surface | Source | Target | Triggered by |
| --- | --- | --- | --- |
| `spiceveg.in` (landing) | `apps/web/` | Cloudflare Pages | Push to `main` (Pages → GitHub integration) |
| `verify.spiceveg.in` (verify SPA) | `apps/verify/` | Cloudflare Pages | **TBD — verify the project's "Git" tab in the CF dashboard** |
| `api.spiceveg.in` + `s.spiceveg.in` | `apps/worker/` | Cloudflare Worker (name: `spiceveg-api`) | `wrangler deploy` from a workstation (no GH Action present) |

### How to confirm where `verify.spiceveg.in` deploys from
1. Open the Cloudflare dashboard → **Pages**.
2. Find the project whose custom domain is `verify.spiceveg.in`.
3. Look at **Settings → Builds & deployments → Git**:
   - If it points to `krishnakoushik9/SpiceVegComingSoon` on branch `main` with build-output directory `apps/verify`, you're done — pushes to `main` redeploy automatically.
   - If it points to `krishnakoushik9/Spice-Veg-Agri-Customer`, **switch it** to this repo (build-output `apps/verify`) and then disable the legacy repo's Pages.
   - If there's no Git connection (manual `wrangler pages deploy` uploads), connect it to this repo, or document the exact `wrangler pages deploy apps/verify --project-name <name>` command in this README under "Manual deploy".

### Legacy mirror — archived
A separate GitHub repo, `github.com/krishnakoushik9/Spice-Veg-Agri-Customer`, used to host a parallel v1.3.0 of the verify SPA. As of `v2.0.0` (May 20, 2026), all extended-schema rendering has been merged into `apps/verify/` in this repo, and `apps/verify/app.js::checkUpdates()` polls this repo. Treat the legacy repo as archived — do not push further commits there.

Note: `apps/verify/` was first committed to git in `85a0ab7` (May 20, 2026). Anything live on `verify.spiceveg.in` before that date was either hand-uploaded to Cloudflare Pages or built from the legacy repo.

## 🚀 Tech Stack Highlights

- **Edge-First:** Entire application runs on Cloudflare's global edge network.
- **Pixel-Perfect:** Preserves the original high-end agricultural design identity.
- **Type-Safe:** End-to-end TypeScript integration.
- **CI/CD:** Automated deployments via GitHub Actions.

## 🛠️ Local Development

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run Development Servers:**
   ```bash
   pnpm dev
   ```

3. **Backend Local Development:**
   ```bash
   cd apps/worker
   pnpm dev
   ```

## 🌐 Deployment Guide

### 1. Cloudflare Setup
- Create a Cloudflare Pages project for `apps/web`.
- Create a Cloudflare Worker for `apps/worker`.
- Create D1, R2, and KV namespaces if required and bind them in `wrangler.toml`.

### 2. GitHub Secrets
Add the following secrets to your GitHub repository:
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Workers and Pages permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID.

### 3. Automatic Deployment
Push to the `main` branch to trigger the GitHub Action defined in `.github/workflows/deploy.yml`.

## 🔒 Security Practices

- **Zod Validation:** All API requests are validated at the edge.
- **CORS Protection:** Configured in the Hono worker.
- **Environment Isolation:** Secrets are managed via Cloudflare Dashboard/Wrangler.
- **JWT Ready:** Architecture supports seamless JWT implementation for auth.

## 🌶️ About SpiceVeg
Founded on May 9th, 2022, SPICEVEG AGRI SEEDS PVT LTD is dedicated to advancing horticultural science through high-yield vegetable seeds and scientific precision.
\n\n---\n*Last updated: Sat May  9 12:51:23 PM IST 2026*
