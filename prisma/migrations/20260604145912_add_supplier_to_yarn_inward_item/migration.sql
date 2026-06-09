-- AlterTable
ALTER TABLE "YarnInwardItem" ADD COLUMN     "supplierId" TEXT;

-- AddForeignKey
ALTER TABLE "YarnInwardItem" ADD CONSTRAINT "YarnInwardItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
