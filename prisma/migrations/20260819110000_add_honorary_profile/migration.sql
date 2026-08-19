ALTER TABLE "Member"
ADD COLUMN "honoraryAppointmentDate" TIMESTAMP(3),
ADD COLUMN "honoraryReason" TEXT;

CREATE TABLE "HonoraryAchievement" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HonoraryAchievement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HonoraryAchievement_memberId_sortOrder_idx" ON "HonoraryAchievement"("memberId", "sortOrder");

ALTER TABLE "HonoraryAchievement"
ADD CONSTRAINT "HonoraryAchievement_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "Member"
SET
  "honoraryAppointmentDate" = to_date(substring("notes" from 'Nombrado el ([0-9]{2}/[0-9]{2}/[0-9]{4})'), 'DD/MM/YYYY'),
  "honoraryReason" = nullif(trim(substring("notes" from '\): (.*)$')), '')
WHERE "type" = 'HONORARIO'
  AND "notes" LIKE 'SOCIO HONORARIO (Nombrado el %';
