-- CreateTable
CREATE TABLE "HotmartConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "basicToken" TEXT NOT NULL,
    "webhookSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotmartConfig_pkey" PRIMARY KEY ("id")
);
