-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('DAY', 'NIGHT');

-- AlterTable
ALTER TABLE "ProductionLog" ADD COLUMN     "shift" "Shift" NOT NULL DEFAULT 'DAY';
