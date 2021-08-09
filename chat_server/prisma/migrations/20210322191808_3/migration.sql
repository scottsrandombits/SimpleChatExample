/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[name]` on the table `Room`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Room.name_unique" ON "Room"("name");
