# Database Design

> **AI Job Application Management Platform**

**Database:** PostgreSQL

**ORM:** Prisma

**Version:** 1.0

---

# 1. Overview

The database is designed using a **relational model** with PostgreSQL as the primary data store.

## Design Goals

- Normalize data (3NF)
- Prevent duplication
- Support future integrations
- Maintain audit history
- Optimize query performance
- Scale to millions of records

The PostgreSQL database is the **single source of truth**. External services (Google Sheets, Trello, AI providers) synchronize with the database rather than storing authoritative data.

---

# 2. Entity Relationship Diagram (ERD)

```text
                    ┌────────────┐
                    │   Users    │
                    └─────┬──────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
     ResumeVersions     Jobs          UserSettings
          │               │
          │               │
          ▼               ▼
     Applications ────────┘
          │
          ├──────────────┐
          ▼              ▼
       Tasks       CoverLetters
          │
          ▼
    Notifications

Jobs
 │
 ├──────── AIRequests
 ├──────── JobSkills
 └──────── AuditLogs
```

---

# 3. Core Entities

| Table           | Purpose                    |
| --------------- | -------------------------- |
| users           | Platform users             |
| jobs            | Imported job opportunities |
| applications    | Job application lifecycle  |
| resume_versions | Multiple resume versions   |
| cover_letters   | Generated cover letters    |
| tasks           | Follow-up & workflow tasks |
| notifications   | Reminder system            |
| ai_requests     | AI request history         |
| audit_logs      | Activity history           |
| user_settings   | User preferences           |
| job_skills      | Extracted skills from jobs |
| refresh_tokens  | Session management         |

---

# 4. Users Table

Stores account information.

```text
users
------
id (UUID)
name
email
password_hash
avatar_url
role
is_verified
created_at
updated_at
deleted_at
```

### Relationships

- One User → Many Jobs
- One User → Many Applications
- One User → Many Resume Versions
- One User → Many Tasks

---

# 5. Jobs Table

Stores every imported job.

```text
jobs
----
id (UUID)

user_id

company

role

location

employment_type

workplace_type

salary_min

salary_max

currency

source

job_url

description

requirements

benefits

experience_required

education

match_score

status

priority

is_favorite

trello_card_id

sheet_row_id

created_at

updated_at
```

### Status Enum

```text
NEW

REVIEWING

READY_TO_APPLY

APPLIED

FOLLOW_UP

INTERVIEW

OFFER

REJECTED

CLOSED
```

### Relationships

- Job belongs to User
- Job has one Application
- Job has many Skills
- Job has many AI Requests
- Job has many Audit Logs

---

# 6. Job Skills

Extracted by AI.

```text
job_skills
----------

id

job_id

skill

category

confidence

created_at
```

Example

```text
TypeScript

React

Docker

AWS

Node.js
```

---

# 7. Applications

Tracks application lifecycle.

```text
applications
------------

id

user_id

job_id

resume_version_id

cover_letter_id

status

applied_at

follow_up_date

interview_date

offer_date

rejection_date

notes

created_at

updated_at
```

### Relationships

Application

belongs to User

belongs to Job

uses Resume Version

uses Cover Letter

---

# 8. Resume Versions

Supports multiple tailored resumes.

```text
resume_versions
---------------

id

user_id

name

target_role

storage_url

ats_score

is_default

created_at

updated_at
```

Example

```text
Frontend Resume

Backend Resume

Fullstack Resume

DevOps Resume
```

---

# 9. Cover Letters

```text
cover_letters
-------------

id

user_id

job_id

content

storage_url

created_by_ai

created_at
```

---

# 10. Tasks

Workflow tasks.

```text
tasks
-----

id

user_id

application_id

type

title

description

due_date

completed

completed_at

created_at
```

Task Types

```text
FOLLOW_UP

INTERVIEW

DOCUMENT

REVIEW

CUSTOM
```

---

# 11. Notifications

```text
notifications
-------------

id

user_id

task_id

type

title

message

is_read

scheduled_at

sent_at

created_at
```

Notification Types

```text
EMAIL

IN_APP

PUSH
```

---

# 12. AI Requests

Stores AI interactions.

```text
ai_requests
-----------

id

user_id

job_id

provider

type

prompt_tokens

completion_tokens

cost

status

response_time_ms

created_at
```

Types

```text
JOB_PARSE

MATCH_SCORE

TAILOR_RESUME

COVER_LETTER

INTERVIEW_PREP
```

---

# 13. Audit Logs

Tracks important actions.

```text
audit_logs
----------

id

user_id

entity

entity_id

action

previous_data

new_data

ip_address

created_at
```

Actions

```text
CREATE

UPDATE

DELETE

LOGIN

IMPORT

EXPORT
```

---

# 14. User Settings

```text
user_settings
-------------

id

user_id

theme

timezone

language

default_resume

email_notifications

trello_enabled

google_sync_enabled

created_at

updated_at
```

---

# 15. Refresh Tokens

```text
refresh_tokens
--------------

id

user_id

token

expires_at

revoked

created_at
```

---

# 16. Relationships

## User

```text
User

├── Jobs

├── Applications

├── Resume Versions

├── Cover Letters

├── Tasks

├── Notifications

├── AI Requests

└── Audit Logs
```

---

## Job

```text
Job

├── Application

├── Job Skills

├── AI Requests

└── Audit Logs
```

---

## Application

```text
Application

├── Resume Version

├── Cover Letter

└── Tasks
```

---

# 17. Enumerations

## UserRole

```text
ADMIN

USER
```

---

## JobStatus

```text
NEW

REVIEWING

READY_TO_APPLY

APPLIED

FOLLOW_UP

INTERVIEW

OFFER

REJECTED

CLOSED
```

---

## EmploymentType

```text
FULL_TIME

PART_TIME

CONTRACT

INTERNSHIP

FREELANCE
```

---

## WorkplaceType

```text
REMOTE

HYBRID

ONSITE
```

---

## Priority

```text
LOW

MEDIUM

HIGH
```

---

# 18. Indexing Strategy

Indexes should be created on:

```text
users.email

jobs.user_id

jobs.status

jobs.company

jobs.match_score

jobs.created_at

applications.user_id

applications.status

tasks.due_date

notifications.is_read

ai_requests.created_at
```

Composite indexes

```text
(user_id, status)

(user_id, created_at)

(job_id, created_at)

(company, role)
```

---

# 19. Constraints

Unique

```text
users.email

jobs.job_url + user_id

refresh_tokens.token
```

Foreign Keys

```text
applications.job_id

applications.user_id

tasks.application_id

notifications.task_id

job_skills.job_id
```

---

# 20. Soft Delete Strategy

Instead of deleting records:

```text
deleted_at TIMESTAMP NULL
```

Used for

- Jobs
- Resume Versions
- Applications

Benefits

- Restore capability
- Audit history
- Prevent accidental loss

---

# 21. Transactions

Use database transactions for:

- Creating applications
- AI resume generation
- Job imports
- Synchronization
- Status changes

Ensures atomic operations.

---

# 22. Performance Considerations

### Pagination

Cursor-based pagination for large datasets.

### Full-Text Search

Use PostgreSQL Full-Text Search for:

- Job titles
- Company names
- Descriptions
- Skills

### JSON Columns

Use `JSONB` for flexible metadata:

```text
jobs.metadata

ai_requests.response

audit_logs.previous_data

audit_logs.new_data
```

---

# 23. Data Retention

| Table           | Retention               |
| --------------- | ----------------------- |
| Audit Logs      | 2 Years                 |
| AI Requests     | 1 Year                  |
| Notifications   | 6 Months                |
| Refresh Tokens  | Until Expiry            |
| Jobs            | Permanent (Soft Delete) |
| Applications    | Permanent               |
| Resume Versions | Permanent               |

---

# 24. Backup Strategy

- Daily full PostgreSQL backup
- Hourly WAL archive
- Point-in-time recovery (PITR)
- Weekly encrypted offsite backup

---

# 25. Prisma Naming Conventions

## Models

```text
User

Job

Application

ResumeVersion

CoverLetter

Task

Notification

AIRequest

AuditLog
```

## Fields

Use `camelCase`.

Example:

```text
createdAt

updatedAt

matchScore

followUpDate

resumeVersionId
```

Database tables use `snake_case` via Prisma `@@map` and `@map` attributes.

---

# 26. Future Expansion

The schema is designed to support future modules without breaking existing relationships.

Planned additions include:

- Companies
- Recruiters
- Interview Notes
- Salary Benchmarks
- Job Collections
- Browser Extension Data
- LinkedIn Profiles
- GitHub Repositories
- Learning Plans
- Career Goals
- AI Career Coach
- Multi-user teams
- Organization workspaces

The design follows PostgreSQL best practices and remains fully compatible with Prisma Migrate for version-controlled schema evolution.
