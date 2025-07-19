/*
  Warnings:

  - You are about to alter the column `otpCode` on the `OTP` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.
  - Added the required column `sessionId` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "sessionId" VARCHAR(50) NOT NULL,
ALTER COLUMN "otpCode" SET DATA TYPE VARCHAR(6);
