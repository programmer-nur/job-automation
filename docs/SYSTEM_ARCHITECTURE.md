# System Architecture

> **AI Job Application Management Platform**

**Version:** 1.0

**Architecture Style:** Modular Monolith (Microservice Ready)

---

# 1. Overview

The system is designed as a **modular monolith** with clear domain boundaries. Each feature is implemented as an independent module with its own routes, controllers, services, repositories, validation schemas, and business logic.

The architecture emphasizes:

- Separation of concerns
- Scalability
- Testability
- Maintainability
- Extensibility
- Cloud readiness

Future migration to microservices should require minimal changes.

---

# 2. High-Level Architecture

```
                           Users
                             │
                             ▼
                    Next.js Frontend
                             │
                    HTTPS / REST API
                             │
                    Express.js Server
                             │
 ┌────────────────────────────────────────────────────┐
 │                    API Layer                       │
 └────────────────────────────────────────────────────┘
                             │
 ┌────────────────────────────────────────────────────┐
 │                Business Logic Layer                │
 │                                                    │
 │ Auth                                               │
 │ Jobs                                               │
 │ Applications                                       │
 │ Resume                                             │
 │ AI                                                 │
 │ Scheduler                                          │
 │ Trello                                             │
 │ Google Sheets                                      │
 │ Dashboard                                          │
 └────────────────────────────────────────────────────┘
                             │
 ┌────────────────────────────────────────────────────┐
 │                Persistence Layer                   │
 │                                                    │
 │ Prisma ORM                                         │
 │ PostgreSQL                                         │
 └────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┴─────────────────┐
          │                                    │
      Redis / BullMQ                    External APIs
          │                                    │
          ▼                                    ▼
 Queue Processing         AI • Trello • Google APIs • Gmail
```

---

# 3. Architecture Principles

## Single Responsibility

Each module has one business responsibility.

Example:

- Jobs
- Resume
- Applications
- Authentication

---

## Dependency Direction

```
Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Database
```

Dependencies only move downward.

---

## Database as Source of Truth

```
PostgreSQL

↓

Google Sheets

↓

Trello

↓

Dashboard
```

The database always contains the canonical state.

External services never own data.

---

## AI as an Assistant

AI provides:

- Suggestions
- Parsing
- Scoring
- Draft generation

AI never performs irreversible actions.

---

# 4. Backend Architecture

```
src/

├── app.ts
├── server.ts

├── config/
│
├── core/
│
├── common/
│
├── middleware/
│
├── modules/
│
├── services/
│
├── queues/
│
├── integrations/
│
├── shared/
│
└── utils/
```

---

# 5. Module Structure

Every feature follows the same layout.

```
jobs/

jobs.routes.ts

jobs.controller.ts

jobs.service.ts

jobs.repository.ts

jobs.validation.ts

jobs.types.ts

jobs.constants.ts

jobs.interface.ts
```

Responsibilities:

## Routes

- API endpoints

---

## Controller

- HTTP handling
- Request parsing
- Response formatting

---

## Service

Business logic.

Never directly accesses Express.

---

## Repository

Database access only.

Uses Prisma.

---

## Validation

Request validation using Zod.

---

## Types

TypeScript interfaces and DTOs.

---

# 6. Layers

## Presentation Layer

Responsibilities

- Routing
- Validation
- Authentication
- HTTP Responses

Technology

- Express
- Zod

---

## Business Layer

Responsibilities

- Job Scoring
- Resume Tailoring
- AI Integration
- Application Workflow

Contains no HTTP logic.

---

## Data Layer

Responsibilities

- Database Queries
- Transactions
- Persistence

Technology

- Prisma ORM

---

## Infrastructure Layer

Responsibilities

- Google APIs
- Trello
- Redis
- BullMQ
- AI Provider
- Email

---

# 7. Request Lifecycle

```
HTTP Request

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Controller

↓

Response
```

---

# 8. Authentication Flow

```
Login

↓

Validate Credentials

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token

↓

Return Tokens
```

Protected endpoints

```
JWT Middleware

↓

User Context

↓

Controller
```

---

# 9. Queue Architecture

Long-running tasks are processed asynchronously.

```
API

↓

BullMQ Queue

↓

Redis

↓

Worker

↓

External API

↓

Database Update
```

Queue types:

- Resume Generation
- Cover Letter Generation
- Trello Sync
- Google Sheets Sync
- Email Notifications
- AI Processing

---

# 10. Scheduler Architecture

Runs using BullMQ repeatable jobs or cron.

Responsibilities

- Follow-up reminders
- Retry failed jobs
- Analytics refresh
- Cleanup
- Status updates

---

# 11. AI Layer

Responsibilities

```
Job Description Parsing

↓

Skill Extraction

↓

Resume Scoring

↓

Resume Tailoring

↓

Cover Letter Generation

↓

Interview Preparation
```

Service Interface

```ts
parseJob();

scoreJob();

tailorResume();

generateCoverLetter();

detectSkillGap();
```

AI providers should be replaceable without changing business logic.

---

# 12. Integration Layer

## Google Sheets

```
Database Change

↓

Sync Queue

↓

Google Sheets API

↓

Update Sheet
```

---

## Trello

```
Application Status Change

↓

Queue

↓

Move Card

↓

Save Card ID
```

---

## Gmail

```
Reminder

↓

Queue

↓

Email Draft

↓

Send Email
```

---

# 13. Database Architecture

Primary Database

PostgreSQL

ORM

Prisma

Main Entities

```
Users

Jobs

Applications

Resume Versions

Tasks

Notifications

Audit Logs

Settings

AI Requests
```

---

# 14. Caching Strategy

Redis caches

- Dashboard Summary
- Frequently Viewed Jobs
- Settings
- AI Responses
- User Session Data

Cache invalidation occurs on write operations.

---

# 15. Error Handling

Global Error Handler

```
Try

↓

Known Error

↓

AppError

↓

HTTP Response
```

Unexpected errors

```
Unknown Error

↓

Logger

↓

500 Response
```

---

# 16. Logging

Use structured logging with Pino.

Log Levels

```
INFO

WARN

ERROR

DEBUG
```

Log

- API Requests
- Authentication
- Database Errors
- Queue Jobs
- AI Requests
- Integrations

---

# 17. Security

Authentication

JWT

Authorization

Role-Based Access Control

Validation

Zod

Additional Protection

- Helmet
- CORS
- Rate Limiting
- Password Hashing
- SQL Injection Protection
- XSS Protection

---

# 18. File Storage

Current

Google Drive

Future

AWS S3

Azure Blob Storage

Cloudflare R2

Only metadata is stored in PostgreSQL.

---

# 19. Configuration

Environment Variables

```
PORT

DATABASE_URL

JWT_SECRET

JWT_REFRESH_SECRET

REDIS_URL

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

GOOGLE_SHEET_ID

TRELLO_API_KEY

TRELLO_TOKEN

OPENAI_API_KEY
```

Configurations are loaded centrally.

---

# 20. Deployment Architecture

```
Internet

↓

Reverse Proxy

↓

Node.js Server

↓

PostgreSQL

↓

Redis

↓

Background Workers
```

Deployable on

- Docker
- Railway
- Render
- Fly.io
- DigitalOcean
- AWS
- Azure
- Google Cloud

---

# 21. Scalability

Current

```
Single API

↓

Single Database

↓

Redis

↓

BullMQ
```

Future

```
API Gateway

↓

Auth Service

Jobs Service

Resume Service

AI Service

Scheduler Service

Notification Service
```

No major architectural changes required.

---

# 22. Monitoring

Recommended Tools

- Pino
- OpenTelemetry
- Sentry
- Prometheus
- Grafana

Monitor

- API latency
- Queue health
- Database performance
- Error rates
- AI usage
- External API failures

---

# 23. Disaster Recovery

- Daily PostgreSQL backups
- Redis persistence
- Retry failed queue jobs
- Audit logs for critical operations
- Restore scripts

---

# 24. Technology Stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Frontend        | Next.js (App Router) |
| Backend         | Node.js + Express    |
| Language        | TypeScript           |
| Database        | PostgreSQL           |
| ORM             | Prisma               |
| Validation      | Zod                  |
| Authentication  | JWT                  |
| Queue           | BullMQ               |
| Cache           | Redis                |
| Logging         | Pino                 |
| AI              | LLM Provider         |
| File Storage    | Google Drive / S3    |
| Reporting       | Google Sheets        |
| Task Management | Trello               |
| Email           | Gmail API            |

---

# 25. Future Architecture

Future enhancements include:

- Event-driven communication
- CQRS for reporting
- Microservice decomposition
- WebSocket notifications
- Browser extension
- Mobile application
- Plugin architecture for additional integrations
- Multiple AI provider support

The current modular monolith is intentionally designed to evolve into a distributed architecture without significant refactoring.
