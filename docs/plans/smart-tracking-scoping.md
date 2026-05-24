# Smart Tracking Scoping Roadmap

## Goal

Make each internship application the single source of truth for interview prep, assets, resume matching, and follow-up behavior.

## Implemented Data Flow

- `internships.last_activity_at` tracks meaningful application activity.
- `internships.resume_match_result` stores the latest resume analysis payload.
- `internships.resume_match_analyzed_at` stores the timestamp of the latest analysis.
- `interview_questions` rows are scoped by `internship_id`.
- `application_assets` rows store links and uploaded files for one internship.

## Routes

- `POST /internships` creates an internship and seeds interview questions.
- `POST /internships/{internship}/extract` processes OCR for an existing internship.
- `GET /internships/{internship}/interview-questions` loads the scoped question set.
- `POST /internships/{internship}/interview-questions` creates a scoped question.
- `PATCH /internships/{internship}/interview-questions/{question}` updates practice state or notes.
- `GET /internships/{internship}/assets` loads application assets.
- `POST /internships/{internship}/assets` uploads a file or saves a link asset.
- `POST /internships/{internship}/resume-match` proxies the resume analysis request and persists the result.

## Storage

- Uploaded assets are stored on the `public` disk.
- Asset metadata lives in the `application_assets` table.
- Resume match results and interview prep state live in the `internships` and `interview_questions` tables.

## Follow-Up Rule

- The follow-up tab uses `last_activity_at`, not `updated_at`.
- Any meaningful action should refresh `last_activity_at`.
- A stale application is flagged after 7 days of inactivity.

## Feature Docs

- [Interview prep](../features/interview-prep.md)
- [Application assets](../features/application-assets.md)
- [Resume matcher](../features/resume-matcher.md)
- [Follow-up](../features/follow-up.md)
