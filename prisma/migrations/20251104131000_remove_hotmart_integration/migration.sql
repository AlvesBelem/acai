-- Remove legacy Hotmart integration artifacts and prepare product catalog for manual management
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_hotmartProductId_key";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "hotmartProductId";

ALTER TABLE "Product"
    ADD COLUMN IF NOT EXISTS "salesPageUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "externalId" TEXT,
    ADD COLUMN IF NOT EXISTS "externalPlatform" TEXT,
    ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Product" ALTER COLUMN "updatedAt" DROP DEFAULT;

DROP TABLE IF EXISTS "HotmartConfig";
