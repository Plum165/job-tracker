# Project Documentation

Detailed architectural notes, design decisions, data model definitions, and user guides for the Job & Career Opportunity Tracker.

## Topics Covered

1. **Architecture & Zero-Backend Privacy**: How shared catalog data interacts with client-side IndexedDB/localStorage workspaces without central data tracking.
2. **Data Model Specification**: Data schemas for `JobOpportunity`, `UserApplicationState`, `Contact`, `DocumentChecklist`, and `Reminder`.
3. **Excel & CSV Import Wizard**: Column auto-detection algorithm and mapping strategies.
4. **Offline Capability & PWA**: How local caching and IndexedDB enable full offline access.
