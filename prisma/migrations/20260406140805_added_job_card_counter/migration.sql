-- CreateTable
CREATE TABLE "JobCardCounter" (
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JobCardCounter_pkey" PRIMARY KEY ("year")
);
