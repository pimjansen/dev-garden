/*
  Warnings:

  - Added the required column `sequence` to the `task_status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task_status" ADD COLUMN     "sequence" INTEGER NOT NULL;
