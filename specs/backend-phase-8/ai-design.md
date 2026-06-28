# Design: Phase 8 — AI Integration Module

## Client Architecture

```typescript
interface AIClient {
  parseJob(description: string): ParseJobResult;
  scoreMatch(resume: string, jobDescription: string): ScoreMatchResult;
  tailorResume(resume: string, jobDescription: string, instructions?: string): string;
  generateCoverLetter(resume: string, jobDescription: string, tone?: string): string;
  detectSkillGap(resume: string, jobDescription: string): SkillGapResult;
  interviewPrep(jobDescription: string, focusArea?: string): InterviewPrepResult;
}
```

## MockAIProvider

Returns realistic-looking mock data. Used when no real AI provider is configured.

## Service Logic

Each AI operation follows the same pattern:

1. Validate input (Zod at controller boundary)
2. Verify referenced entities exist (job, resume via repositories)
3. Create AIRequest record with status "processing"
4. Call AI client
5. Update AIRequest record with response/status
6. Return result

## Data Flow

```
HTTP Request → Controller (Zod) → Service → AI Client (Mock) → AIRequest (DB)
                                                   ↓
                                             Mock response
                                                   ↓
                                  Update AIRequest → Return result
```

## Endpoint Design

### POST /ai/parse-job
Input: { jobId: uuid, jobDescription: string }
Response: { title, company, skills[], experience, education, employmentType }

### POST /ai/score-job
Input: { jobId: uuid, resumeContent: string }
Response: { score: number, strengths[], gaps[], suggestions[] }

### POST /ai/tailor-resume
Input: { resumeId: uuid, jobId: uuid, instructions?: string }
Response: { content: string, changes: string }

### POST /ai/generate-cover-letter
Input: { jobId: uuid, resumeContent: string, tone?: string }
Response: { content: string }

### POST /ai/skill-gap
Input: { jobId: uuid, resumeContent: string }
Response: { matchedSkills[], missingSkills[], suggestions[] }

### POST /ai/interview-prep
Input: { jobId: uuid, focusArea?: string }
Response: { questions[], tips[], topics[] }

## Error Codes

| Code     | Description                |
|----------|----------------------------|
| AI_001   | AI provider unavailable    |
| AI_002   | AI resume tailoring not implemented |
| AI_003   | AI cover letter generation not implemented |

## Test Plan

### Service Tests (18)
Mock both AI client and repositories.

Each operation tested:
- Success path (mock client returns data, AIRequest created+updated)
- Entity not found (job/resume doesn't exist → 404)

### Integration Tests (14)
Mock the entire AI service. Test HTTP pipeline.

- Each endpoint: 201 success, 422 validation, 401 no auth
