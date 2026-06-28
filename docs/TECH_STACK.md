# Technology Stack

> AI Job Application Management Platform

## Overview

This project uses a modern, scalable, and production-ready technology stack designed for performance, maintainability, and developer productivity.

---

# System Overview

```
Frontend (Next.js)

↓

REST API (Express)

↓

Prisma ORM

↓

PostgreSQL

↓

Redis + BullMQ

↓

External APIs
```

---

# Frontend

## Framework

- Next.js 16 (App Router)

### Why?

- Server Components
- Client Components
- File-based routing
- Server Actions (future)
- Excellent SEO
- Fast rendering

---

## Language

- TypeScript

### Why?

- Type Safety
- Better IDE support
- Fewer runtime errors
- Easier refactoring

---

## Styling

- Tailwind CSS

### Why?

- Utility-first
- Fast development
- Responsive design
- Excellent ecosystem

---

## UI Components

- shadcn/ui

### Why?

- Accessible components
- Built on Radix UI
- Fully customizable
- No vendor lock-in

---

## Component Library

Uses

- Radix UI
- Lucide React
- class-variance-authority
- clsx
- tailwind-merge

---

## Forms

- React Hook Form

Validation

- Zod

### Why?

- High performance
- Minimal re-renders
- Excellent TypeScript support

---

## Data Fetching

- Redux Toolkit
- RTK Query

### Why?

- API caching
- Automatic re-fetching
- Optimistic updates
- Request deduplication

---

## State Management

- Redux Toolkit

For

- Authentication
- User session
- Global UI state

---

## Icons

- Lucide React

---

## Tables

- TanStack Table

---

## Charts

- Recharts

---

## Date Handling

- date-fns

---

## Resume Builder

Libraries

- React PDF
- react-to-print
- html2canvas
- jsPDF

---

## Rich Text Editor

- Tiptap

Used for

- Resume editing
- Cover letters
- Notes

---

# Backend

## Runtime

- Node.js

---

## Framework

- Express.js

### Why?

- Lightweight
- Flexible
- Large ecosystem
- Production proven

---

## Language

- TypeScript

---

## ORM

- Prisma

### Why?

- Type-safe queries
- Excellent migrations
- Great developer experience

---

## Database

- PostgreSQL

### Why?

- ACID compliant
- JSON support
- Full-text search
- Highly scalable

---

## Validation

- Zod

---

## Authentication

- JWT
- Refresh Tokens
- bcrypt

---

## Logging

- Pino

---

## Background Jobs

- BullMQ

---

## Cache

- Redis

---

## Scheduler

- BullMQ Repeatable Jobs

---

## File Upload

- Multer

Storage

- Google Drive
- AWS S3 (future)

---

## AI Integration

Provider-agnostic architecture supporting:

- OpenAI
- Anthropic
- Google Gemini
- Local LLMs (future)

---

# Integrations

- Google Sheets API
- Trello API
- Gmail API
- Google Drive API

---

# Development Tools

## Package Manager

- pnpm

---

## Linter

- ESLint

---

## Formatter

- Prettier

---

## Git Hooks

- Husky

---

## Commit Standards

- Commitlint
- Conventional Commits

---

## Environment Validation

- dotenv
- Zod

---

## Testing

Backend

- Vitest
- Supertest

Frontend

- Vitest
- React Testing Library

E2E

- Playwright

---

## Documentation

- Swagger / OpenAPI
- Markdown Documentation

---

## Deployment

Frontend

- Vercel

Backend

- Railway / Render / AWS

Database

- PostgreSQL

Cache

- Redis

---

# Future Technologies

- Docker
- Kubernetes
- OpenTelemetry
- Grafana
- Prometheus
- Sentry
- Meilisearch
- Elasticsearch
- WebSockets
- gRPC

---

# Why This Stack?

This technology stack was selected to provide:

- End-to-end TypeScript
- Strong type safety
- Excellent developer experience
- High performance
- Scalability
- Maintainability
- Production readiness
- Easy cloud deployment
- Future microservice compatibility
