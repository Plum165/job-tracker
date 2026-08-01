# Backend & Local Persistence Layer

## Zero-Backend Architecture

To guarantee strict privacy and zero cloud hosting overhead, the application deliberately avoids central backend servers or tracking databases.

### Key Components

- **Virtual Data Layer (`storage.ts`)**: Wraps browser `IndexedDB` with `localStorage` fallback to manage user private states, contacts, interview dates, and documents.
- **Shared Job Catalog (`sharedOpportunities.json`)**: Embedded version-controlled dataset of company software, data, and graduate/internship opportunities.
- **Data Export & Encryption Interface**: Exports and imports private JSON backups directly within the user's local filesystem.
