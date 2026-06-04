-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "fabricItemId" TEXT;

-- AlterTable
ALTER TABLE "YarnInward" ADD COLUMN     "fabricItemId" TEXT;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInward" ADD CONSTRAINT "YarnInward_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
