# Follow-Up

## Behavior

- Follow-up guidance is based on `last_activity_at`.
- An application is considered stale after 7 days without meaningful activity.
- The tab generates a tailored follow-up email based on the internship status.

## Data Model

- `internships.last_activity_at`

## UI Interaction

- The tab warns when the application has been inactive for 7 or more days.
- The user can set a recruiter name, add optional context, choose a tone, copy the email, or open a `mailto:` link.

## Notes

- The warning does not use `updated_at`.
- Any note, timeline, interview prep, asset, or resume analysis action should refresh `last_activity_at`.
