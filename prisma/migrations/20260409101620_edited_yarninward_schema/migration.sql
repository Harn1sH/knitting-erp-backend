/*
  Warnings:

  - Added the required column `remarks` to the `YarnInward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weightPerBag` to the `YarnInward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YarnInward" ADD COLUMN     "remarks" TEXT NOT NULL,
ADD COLUMN     "weightPerBag" DOUBLE PRECISION NOT NULL;
