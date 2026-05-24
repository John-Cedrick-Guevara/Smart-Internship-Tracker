# Interview Prep

## Behavior

- Every internship has its own interview question set.
- New internships are seeded with role-aligned questions when OCR did not provide a custom set.
- OCR imports can attach extracted questions to the internship being created or edited.
- Practice status and scratchpad notes are stored per question.

## Data Model

- `interview_questions.internship_id`
- `interview_questions.question`
- `interview_questions.category`
- `interview_questions.strategic_tip`
- `interview_questions.talking_points`
- `interview_questions.is_practiced`
- `interview_questions.answer_notes`

## Routes

- `GET /internships/{internship}/interview-questions`
- `POST /internships/{internship}/interview-questions`
- `PATCH /internships/{internship}/interview-questions/{question}`
- `DELETE /internships/{internship}/interview-questions/{question}`

## UI Interaction

- The drawer loads the internship-scoped questions directly from the internship payload.
- Users can mark a question as practiced.
- Users can write and save notes for each question.
- Users can add and delete custom questions for the application.

## Notes

- The prep tab no longer depends on localStorage for the question set or practice state.
- `last_activity_at` is refreshed when questions are created, updated, or deleted.
