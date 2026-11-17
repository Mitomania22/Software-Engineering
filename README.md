Smart Campus: Room Availability Checker 📖 Project Overview This project is a web-based Room Availability Checker built for the Smart Campus initiative. It allows users to check if a specific room is available for a requested time slot based on fictional pre-existing bookings

This project was developed as part of the Software Engineering course (Lesson #10 Practice) and is designed to be an agent-ready repository with clear boundaries, verification steps, and structured context for AI coding assistants

🎯 Acceptance Contract (Core Rules) Any changes to this codebase (whether by a human or an AI agent) must preserve the following rules:

Time Validation: Reject invalid times, past times, and enforce the allowed duration limits

Conflict Validation: Reject any request that overlaps with an existing booking or a blocked-room request

Data Integrity: Keep the stored fictional booking data completely unchanged during availability checks

User Feedback: Provide clear, readable availability feedback (Success/Error messages)

Responsiveness: Ensure usable behavior on both desktop and mobile screens

🔒 Security & Privacy Boundaries No Real Data: This project uses fictional bookings only. Do not introduce real personal information (PII)

No Secrets: Do not commit .env files, API keys, or secrets

No External Production Services: Do not connect this app to external production databases or live external APIs

Sandboxing: AI-generated code must run in an isolated environment (sandbox) away from the host machine to prevent malicious or accidental system damage
