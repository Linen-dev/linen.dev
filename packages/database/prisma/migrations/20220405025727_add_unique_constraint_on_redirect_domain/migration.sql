/*
  Warnings:

  - A unique constraint covering the columns `[redirectDomain]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "accounts_redirectDomain_key" ON "accounts"("redirectDomain");
