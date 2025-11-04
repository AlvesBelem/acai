-- Add extra lead profile fields
ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "phone" TEXT,
    ADD COLUMN IF NOT EXISTS "locale" TEXT,
    ADD COLUMN IF NOT EXISTS "company" TEXT,
    ADD COLUMN IF NOT EXISTS "jobTitle" TEXT,
    ADD COLUMN IF NOT EXISTS "location" TEXT;
