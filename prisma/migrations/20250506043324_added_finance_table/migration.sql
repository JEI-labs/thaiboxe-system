-- CreateEnum
CREATE TYPE "EPaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'PIX', 'BOLETO');

-- CreateEnum
CREATE TYPE "EFinanceEntryStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EFinanceEntryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "paymentMethod" "EPaymentMethod",
    "description" TEXT,
    "referenceId" TEXT,
    "type" "EFinanceEntryType" NOT NULL,
    "status" "EFinanceEntryStatus" NOT NULL DEFAULT 'PENDING',
    "currency" TEXT DEFAULT 'BRL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceEntry_userId_date_idx" ON "FinanceEntry"("userId", "date");

-- CreateIndex
CREATE INDEX "FinanceEntry_userId_status_idx" ON "FinanceEntry"("userId", "status");

-- CreateIndex
CREATE INDEX "FinanceEntry_userId_category_idx" ON "FinanceEntry"("userId", "category");

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
