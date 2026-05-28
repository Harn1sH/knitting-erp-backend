/*
  Warnings:

  - Added the required column `entryDate` to the `YarnInward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "YarnInward" ADD COLUMN     "entryDate" TIMESTAMP(3) NOT NULL;
