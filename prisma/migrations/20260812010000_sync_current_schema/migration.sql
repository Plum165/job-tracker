-- Repair users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "preferences" TEXT DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create job opportunities table
CREATE TABLE IF NOT EXISTS "job_opportunities" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "jobTitle" TEXT NOT NULL,
    "jobCategory" TEXT NOT NULL,
    "companyDescription" TEXT NOT NULL,
    "companyWebsite" TEXT NOT NULL,
    "applicationLink" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workArrangement" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openingDate" TEXT,
    "closingDate" TEXT NOT NULL,
    "generalNotes" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,

    CONSTRAINT "job_opportunities_pkey" PRIMARY KEY ("id")
);

-- Create user application states table
CREATE TABLE IF NOT EXISTS "user_application_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dateApplied" TEXT,
    "personalNotes" TEXT NOT NULL DEFAULT '',
    "followUpDate" TEXT,
    "interviewDates" TEXT NOT NULL DEFAULT '[]',
    "documentsPrepared" TEXT NOT NULL DEFAULT '{}',
    "personalLinks" TEXT NOT NULL DEFAULT '[]',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_application_states_pkey" PRIMARY KEY ("id")
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "opportunityId" TEXT,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedIn" TEXT NOT NULL,
    "howMet" TEXT NOT NULL,
    "dateContacted" TEXT NOT NULL,
    "lastInteractionDate" TEXT NOT NULL,
    "followUpDate" TEXT,
    "privateNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "job_opportunities"
ADD CONSTRAINT "job_opportunities_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "user_application_states"
ADD CONSTRAINT "user_application_states_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "user_application_states"
ADD CONSTRAINT "user_application_states_opportunityId_fkey"
FOREIGN KEY ("opportunityId")
REFERENCES "job_opportunities"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "contacts"
ADD CONSTRAINT "contacts_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Unique application per user/job
CREATE UNIQUE INDEX IF NOT EXISTS "user_application_states_userId_opportunityId_key"
ON "user_application_states"("userId", "opportunityId");