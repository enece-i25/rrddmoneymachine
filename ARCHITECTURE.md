# rrdd-money architecture

## Overview

rrdd-money is a pnpm monorepo with 3 runtime services:

- web: React 18 + Vite + TypeScript
- api: Node.js + Express + TypeScript
- db: PostgreSQL 16

The product focuses on active verified audience support for live streams. Business rules for compliance, tiers, and package pricing live in server and shared modules, never in client UI calculations.

## Monorepo layout

- apps/web: frontend app
- apps/api: backend API, services, jobs, db migrations
- packages/shared: domain types and shared pricing/compliance/tier logic

## Authentication flow

- POST /auth/register creates users with role and profile
- OTP-like verification flow:
  - POST /auth/verify-email
  - POST /auth/verify-phone
- POST /auth/login returns 15 min access token and sets refresh token in httpOnly cookie
- POST /auth/refresh rotates access and refresh token
- POST /auth/logout clears refresh cookie

Token storage in frontend:

- access token kept in memory only
- refresh token only via cookie with credentials include

## Database and migrations

- Postgres extension pgcrypto enabled at db bootstrap and migration
- SQL migrations are versioned in apps/api/src/db/migrations
- migration runner script: pnpm --filter @rrdd/api db:migrate

## Compliance and tiering

Shared rules:

- compliance: effective_time = session_time - missed_windows * interval
- payout policy:
  - >= 80 percent full
  - 50 to 79 percent proportional
  - < 50 percent no payment
- tiers use trailing window of 15 sessions with hysteresis and 5 grace sessions before downgrade

## Credits and disputes

- provider credit is internal only
- no direct card refund from credit service
- expiration: 90 days, warning 30 days before
- exceptional withdrawal only in last 10 days before expiration
- client balance release window respects 48-hour dispute period

## Running locally without Docker

1. Copy .env.example to .env and fill required values.
2. Start PostgreSQL (container or local).
3. Install deps:
   - pnpm install
4. Apply migrations:
   - pnpm db:migrate
5. Run apps:
   - pnpm --filter @rrdd/api dev
   - pnpm --filter @rrdd/web dev

## Running with Docker

1. Create .env from .env.example.
2. Build and start:
   - docker-compose up --build
3. Optional hot-reload dev setup:
   - docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

   The production web container is available on port 8081. The development override serves Vite on port 8082.

## Docker services

- db: postgres:16-alpine with named volume pgdata
- api: node 20 alpine multi-stage image
- web: vite build served by nginx alpine multi-stage image

All services communicate through explicit rrdd-network network.

## Realtime and heartbeat

Socket.IO runs on the API HTTP port and authenticates with the access JWT during the handshake. Users join only their scoped provider/collaborator room; admins join `admin`.

The heartbeat monitor reads `HEARTBEAT_INTERVAL_MS` (default 5 minutes) and `HEARTBEAT_WINDOW_MS` (default 90 seconds). For QA only, use an uncommitted `.env.local` or Compose environment override such as 20000ms/10000ms; never change the production defaults in `.env.example`.

The browser requests Web Notifications permission when a collaborator receives a heartbeat prompt. Firebase Cloud Messaging remains the next step for notifications while the app is fully closed.

## QA heartbeat seed

The guarded development-only seed creates three idempotent QA users and one `en_curso` session:

   $env:ALLOW_SEED="true"
   docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm -e ALLOW_SEED=true api pnpm --filter @rrdd/api seed

Credentials are printed by the command and use the password `Test1234!`. The seed refuses to run unless `ALLOW_SEED=true` and `NODE_ENV` is not production. The production API image intentionally excludes `tsx`, so use the explicit development Compose command above for seeding.

For short QA heartbeat cycles in PowerShell, set these variables before recreating the API:

   $env:HEARTBEAT_INTERVAL_MS="20000"
   $env:HEARTBEAT_WINDOW_MS="10000"
   docker compose up -d --build api

The test session is `en_curso` immediately after seeding. Its first prompt is scheduled by the API startup scan, so no manual status transition is required.
