# Resume Matcher

## Behavior

- The drawer sends resume text to a Laravel proxy endpoint.
- The proxy can forward the request to a configurable FastAPI service.
- The latest match result is persisted on the internship so reopening the drawer restores it.

## Data Model

- `internships.resume_match_result`
- `internships.resume_match_analyzed_at`

## Routes

- `GET /internships/{internship}/resume-match`
- `POST /internships/{internship}/resume-match`

## Storage

- The resume text itself is not stored as a permanent artifact.
- The analysis result JSON is stored on the internship row.

## UI Interaction

- Users paste resume text or select a file to identify the draft name.
- The UI sends the analysis request through Laravel.
- The result card shows score, matched keywords, missing keywords, strengths, gaps, and recommendations.

## Notes

- If the FastAPI endpoint is not configured, the controller falls back to a local heuristic result so the feature remains usable.
- `last_activity_at` is refreshed when the analysis is saved.
