# Resume Job Alignment With Gemini

## Context

The application already has internship-scoped assets, interview questions, and a resume matcher tab. The current resume matcher accepts pasted text and can call a configurable proxy, while OCR-generated interview questions may be stored before the user saves the application.

## Goal

Implement a Gemini-backed resume alignment review that scores how well a user's resume fits a saved application from 0-100, with useful comments. Users must be able to analyze either a newly uploaded resume, pasted resume text, or a resume already saved as an application asset. Interview questions must only be stored when the user saves the application.

## Scope

- Add Gemini API configuration for resume alignment.
- Extend the resume matcher endpoint to accept uploaded files, saved assets, or pasted text.
- Keep the existing stored result fields on internships.
- Update the React resume matcher UI to expose the source choice.
- Remove automatic/default interview question creation outside application save.
- Preserve manual question creation from the interview prep tab.

## Plan

1. Configure Gemini in Laravel services with API key, model, and timeout environment variables.
2. Update `ResumeMatchController` to build a structured Gemini request using application details and resume content.
3. Normalize Gemini JSON responses into the existing result shape plus an overall summary.
4. Support saved resume assets by resolving asset ownership and using stored files or asset metadata.
5. Update `ResumeMatcherTab` to let users choose saved asset, upload, or pasted text before analysis.
6. Remove immediate OCR question persistence and default seeded questions.
7. Allow application save/update to persist explicit extracted interview questions when provided.
8. Add tests for saved-asset resume analysis and no default question creation.

## Validation

- Feature tests cover no default question creation, explicit question persistence, and resume match storage through Gemini.
- Frontend build validates TypeScript changes.
- Existing manual interview question routes continue to store user-created questions.

## Risks

- Gemini file support depends on model/API behavior and configured API key. The local heuristic fallback keeps the feature usable when Gemini is unavailable.
- Link-only assets do not guarantee readable resume content unless Gemini or a future fetcher can access the URL.
