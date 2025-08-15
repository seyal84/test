# HomeFlow MVP/PoC

HomeFlow is an AI-powered real estate transaction platform. This repository contains a monorepo with the backend API (NestJS + Prisma), web frontend (React + Vite), and a minimal React Native scaffold.

## Quick start (local)

Requirements: Node 18+, Docker, Docker Compose

1. Copy environment file and adjust as needed:

```bash
cp .env.example .env
```

2. Start services:

```bash
docker compose up --build
```

3. Open the app:
- API: http://localhost:3000
- Web: http://localhost:5173

The backend will apply Prisma schema and seed data on first run.

## Monorepo structure

- `apps/backend`: NestJS API with Prisma/Postgres, Cognito JWT auth, RBAC, listings, offers, escrow, service directory, integrations (mocked), S3 presign
- `apps/web`: React + Vite web app with major flows (login redirect, listings browse, seller create listing, offers, escrow overview)
- `apps/mobile`: React Native (Expo) minimal scaffold
- `infra/terraform`: Terraform IaC stubs for AWS (ECS Fargate, RDS, ALB)

## Environment

See `.env.example` for required variables. No secrets are committed; supply via environment variables or AWS Secrets Manager.

## Testing

- Backend unit tests: `npm -w apps/backend run test`
- Web e2e (Cypress): `npm -w apps/web run cypress`

## Deployment

- Dockerfiles for backend and web
- GitHub Actions workflow for CI (lint, test, build)
- Terraform stubs for AWS ECS Fargate blue/green strategy

## Security

- JWT validation against AWS Cognito JWKS
- RBAC at route level
- Helmet, rate limiting
- Audit logging for critical actions

## GDPR

- Right-to-delete endpoint implemented as anonymization of user data and cascade where applicable

## Notes

- Hugging Face integration is optional. If `HF_API_TOKEN` is not set, the backend falls back to a lightweight heuristic tagging.
- Stripe and DocuSign integrations are mocked for MVP. Replace with real keys and flows for production.