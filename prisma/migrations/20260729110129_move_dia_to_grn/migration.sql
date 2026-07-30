-- AlterTable
ALTER TABLE "FabricItem" ALTER COLUMN "dia" DROP NOT NULL;

-- AlterTable
ALTER TABLE "YarnInwardItem" ADD COLUMN     "dia" TEXT;
