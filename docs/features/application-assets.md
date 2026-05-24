# Application Assets

## Behavior

- Assets belong to one internship application.
- Users can save link-based assets or upload a file.
- Uploaded files are stored on Laravel's `public` disk.
- Link assets store the external URL in the database.

## Data Model

- `application_assets.internship_id`
- `application_assets.label`
- `application_assets.asset_type`
- `application_assets.asset_kind`
- `application_assets.status`
- `application_assets.url`
- `application_assets.file_name`
- `application_assets.file_path`
- `application_assets.mime_type`
- `application_assets.file_size`

## Routes

- `GET /internships/{internship}/assets`
- `POST /internships/{internship}/assets`
- `PATCH /internships/{internship}/assets/{asset}`
- `DELETE /internships/{internship}/assets/{asset}`

## UI Interaction

- The tab supports adding a new asset with a label, type, status, and optional file upload.
- Existing assets can be edited inline.
- Users can copy or open the stored URL.
- Deleting a file asset also removes the stored file from disk.

## Notes

- The assets tab no longer uses localStorage.
- Any create, update, or delete action refreshes `last_activity_at`.
