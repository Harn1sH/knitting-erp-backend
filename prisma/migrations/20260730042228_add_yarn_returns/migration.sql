-- CreateTable
CREATE TABLE "YarnReturn" (
    "id" TEXT NOT NULL,
    "dcNumber" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vehicleNumber" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YarnReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnReturnItem" (
    "id" TEXT NOT NULL,
    "yarnReturnId" TEXT NOT NULL,
    "fabricItemId" TEXT,
    "yarnName" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "weightPerBag" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YarnReturn_dcNumber_key" ON "YarnReturn"("dcNumber");

-- AddForeignKey
ALTER TABLE "YarnReturn" ADD CONSTRAINT "YarnReturn_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReturn" ADD CONSTRAINT "YarnReturn_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReturnItem" ADD CONSTRAINT "YarnReturnItem_yarnReturnId_fkey" FOREIGN KEY ("yarnReturnId") REFERENCES "YarnReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnReturnItem" ADD CONSTRAINT "YarnReturnItem_fabricItemId_fkey" FOREIGN KEY ("fabricItemId") REFERENCES "FabricItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
