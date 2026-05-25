# Resume Matcher

## Behavior

- The drawer sends a selected resume source to Laravel: uploaded file, pasted text, or saved resume asset.
- Laravel uses Gemini as the primary alignment engine and can fall back to the legacy configurable proxy or local heuristic.
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

- Users choose an upload, a saved resume asset, or pasted resume text.
- The UI sends the analysis request through Laravel.
- The result card shows score, summary, matched keywords, missing keywords, strengths, gaps, and recommendations.

## Notes

- If Gemini and the FastAPI endpoint are not configured, the controller falls back to a local heuristic result so the feature remains usable.
- `last_activity_at` is refreshed when the analysis is saved.
