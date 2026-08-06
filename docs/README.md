# Project Documentation

Detailed architectural notes, design decisions, data model definitions, and backend persistence guides for Opportunity Hub.

## Topics Covered

1. **Enterprise Full-Stack JWT Authentication Engine**: Multi-identifier login (Email, Student ID, Employee ID, Username), dual-token JWT security with 15-minute access tokens and rotated 7-day refresh tokens.
2. **Database Persistence Layer (PostgreSQL & Prisma ORM)**: Relational schema management with Prisma ORM, migrations, seeding, and repository implementations (`UserRepository`, `TokenRepository`).
3. **Layered Express Architecture**: Clean separation between Controllers, Services, Repositories, and Database client models.
4. **Architecture & Zero-Backend Privacy**: How shared catalog data interacts with client-side IndexedDB/localStorage workspaces without central data tracking.
5. **Data Model Specification**: Data schemas for `User`, `RefreshToken`, `JobOpportunity`, `UserApplicationState`, `Contact`, `DocumentChecklist`, and `Reminder`.
