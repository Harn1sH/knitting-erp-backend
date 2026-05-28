-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "challanNo" TEXT NOT NULL,
    "vehicle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCard" (
    "id" TEXT NOT NULL,
    "jobNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "gsm" DOUBLE PRECISION NOT NULL,
    "dia" DOUBLE PRECISION NOT NULL,
    "composition" TEXT NOT NULL,
    "count" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "totalYarnNeeded" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "operatorId" TEXT,
    "machine" TEXT NOT NULL,
    "kgProduced" DOUBLE PRECISION NOT NULL,
    "hoursRun" DOUBLE PRECISION NOT NULL,
    "stoppage" TEXT,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnInward" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "yarnName" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "cones" INTEGER NOT NULL,
    "netWeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YarnInward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobCard_jobNumber_key" ON "JobCard"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnInward" ADD CONSTRAINT "YarnInward_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
