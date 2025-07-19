-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "otpCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OTP_otpCode_key" ON "OTP"("otpCode");

-- CreateIndex
CREATE INDEX "OTP_otpCode_idx" ON "OTP"("otpCode");

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
