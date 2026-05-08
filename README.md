# SpiceVeg Agri Seeds - Modern Cloudflare Stack

A production-grade, full-stack architecture optimized for Cloudflare Edge infrastructure.

## 🏗️ Architecture

- **Monorepo:** Managed with `pnpm` and `Turborepo`.
- **Frontend (`apps/web`):** Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion.
- **Backend (`apps/worker`):** Cloudflare Workers using the Hono framework.
- **UI Components (`packages/ui`):** Shared React components (Ready for shadcn/ui).
- **Database:** Cloudflare D1 (SQL).
- **Storage:** Cloudflare R2 (Object Storage).
- **Caching:** Cloudflare KV (Key-Value).

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
