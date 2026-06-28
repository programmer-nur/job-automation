# Spec: AI Integration Module

## Purpose
Provider-agnostic AI integration for job parsing, match scoring, resume tailoring, cover letter generation, skill gap detection, and interview preparation. All requests/responses are logged in the `ai_requests` table for audit.

## Prisma Model (`AIRequest`)

| Field        | Type      | Notes                     |
|------------- |-----------|---------------------------|
| id           | UUID      | PK                        |
| userId       | UUID      | FK → users                |
| type         | String    | Operation type            |
| prompt       | String    | Input sent to AI          |
| response     | String?   | AI response text          |
| model        | String    | AI model used             |
| tokensUsed   | Int?      | Token count               |
| durationMs   | Int?      | Request duration (ms)     |
| status       | String    | pending/completed/failed  |
| errorMessage | String?   | Error details if failed   |
| createdAt    | DateTime  |                           |
| updatedAt    | DateTime  |                           |

## AI Client Architecture

```
AI Client Interface ← MockAIProvider (default)
                    ← OpenAIProvider (future)
                    ← AnthropicProvider (future)
                    ← GeminiProvider (future)
```

Provider selected by `AI_PROVIDER` env var (default: `mock`).

## Endpoints

All return mock data currently. Real AI requires API keys.

| Method | Path                    | Description               |
|--------|-------------------------|---------------------------|
| POST   | /ai/parse-job           | Parse job description     |
| POST   | /ai/score-job           | Score resume-job match    |
| POST   | /ai/tailor-resume       | Tailor resume for job     |
| POST   | /ai/generate-cover-letter | Generate cover letter   |
| POST   | /ai/skill-gap           | Detect skill gaps         |
| POST   | /ai/interview-prep      | Generate interview prep   |

## Validation Rules

- `parseJobSchema`: jobDescription (required, max 50000), jobId (UUID, optional)
- `scoreJobSchema`: resumeContent (required, max 50000), jobId (UUID, required)
- `tailorResumeSchema`: resumeId (UUID, required), jobId (UUID, required), instructions (max 2000, optional)
- `generateCoverLetterSchema`: resumeContent (required, max 50000), jobId (UUID, required), tone (max 50, optional)
- `skillGapSchema`: resumeContent (required, max 50000), jobId (UUID, required)
- `interviewPrepSchema`: jobId (UUID, required), focusArea (max 100, optional)

## Module Structure

```
modules/ai/
├── ai.client.ts         ← AI provider interface + MockAIProvider
├── ai.types.ts
├── ai.validation.ts
├── ai.repository.ts     ← AIRequest CRUD
├── ai.service.ts
├── ai.controller.ts
├── ai.routes.ts
└── index.ts
```
