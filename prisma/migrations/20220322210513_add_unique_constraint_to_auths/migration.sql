/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `auths` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "auths_email_key" ON "auths"("email");
