Here is a comprehensive project context document designed to onboard new agents or developers. It outlines the problem, the evolution of the application into a dual Internship and Job Tracker, the technical solutions we’ve implemented, and a raw, witty tagline that sets the tone for why this system exists.

🏷️ The Brand Identity
The Tagline
"Unemployed? It might be your system that's screwing you—not just your skill issue."

The Core Mission
To turn job-hunting from a chaotic, manual chore into an automated, data-driven pipeline. We help individuals optimize their application throughput and interview readiness, drastically increasing their chances of getting employed.

❌ The Problem Landscape
Job seekers and students looking for internships face a frustrating, disorganized pipeline:

The Copy-Paste Fatigue: Tracking 20+ applications a day manually across LinkedIn, Facebook, and school portals requires endless copying and pasting of company names, role descriptions, contact emails, and deadlines.

The "Black Hole" Effect: Job seekers lose track of which version of their resume they sent where, when they should follow up, and what the specific requirements were once a job posting gets taken down.

The Preparation Gap: Landing an interview call is only half the battle. Job seekers often fail interviews because they don't have immediate, highly tailored practice questions based exactly on what that specific company was looking for in their posting.

🚀 The Solution: A Smart Application Pipeline
We have evolved from a simple student internship tracking tool into a robust Smart Internship and Job Application Tracker.

Instead of forcing users to fill out endless form fields, our platform leverages a distributed AI architecture to automate the data entry and preparation loop. A user simply drops a screenshot of an internship or job opening into the UI, and the system automatically coordinates the heavy lifting.

🏗️ The Distributed Architecture (Technical Breakdown)
To keep the platform incredibly fast, scalable, and highly accurate, we built a distributed system across three distinct environments.

Here is how the data flows end-to-end when a user uploads an image:

1. The Gateway Stack (Laravel & React)
Role: The control center and traffic coordinator.

Flow: The React frontend securely uploads the raw screenshot image file to our Laravel backend server (running on port 8000). Laravel validates the file type/size limits, sets up connection timeout boundaries, and forwards the file block straight to our microservice.

Storage Strategy: To keep the database lean and performant, we don't bloat SQLite with heavy image binary files (BLOBs). Instead, we store the raw image assets on a dedicated storage folder/bucket and save only the lightweight path string inside our database schema.

2. The Layout Parser (Python & FastAPI VPS)
Role: A dedicated, open-source AI microservice running on a VPS (port 8001).

Flow: Running deep learning vision models on standard serverless backends causes immediate connection timeouts. Our FastAPI microservice loads deepseek-ai/DeepSeek-OCR into hardware memory.

The OCR Solution: Using a specialized visual grounding layout prompt (<|grounding|>Convert the document to markdown), the model reads columns, sidebars, and chaotic text from the screenshot for free and transforms it into structured Markdown text, which it returns to Laravel.

3. The Structural Optimizer (Google Gemini 1.5/3.5 Flash)
Role: High-speed text-to-JSON structural mapping.

Flow: Laravel catches the pure Markdown string from the VPS and forwards it to the Gemini Flash API using an authenticated X-goog-api-key header block.

The Token Saving Solution: Because we pass pure text to Gemini instead of a heavy multi-modal image, we bypass Gemini's heavy image token costs, dropping consumption down to a measly ~100 tokens per request.

Structured Output: We pass a native response_schema map inside the payload. This forces Gemini to respond strictly with a raw JSON object containing parsed values for company_name, company_email, position, location, duration, is_paid, and 5 custom, single-sentence interview questions generated automatically for that role.

4. Persistence & Presentation
Flow: Laravel decodes the clean JSON object, loops through the generated interview questions, inserts them into the database using the InterviewQuestion Eloquent model, and drops the organized job entry directly into the user's interactive Kanban board dashboard (To Apply ➔ Applied ➔ Interviewing ➔ Offered).

🎯 Current Agent Checklist & Status
As an agent working on this pipeline, keep these critical local environmental boundaries in mind:

Port Alignment: Laravel gateway sits on port 8000; Python FastAPI microservice sits on port 8001.

API Constraints: Gemini endpoints require exact header serialization casing (X-goog-api-key), and local local machines might need an updated cacert.pem configuration in their php.ini file to clear cURL SSL validation errors.