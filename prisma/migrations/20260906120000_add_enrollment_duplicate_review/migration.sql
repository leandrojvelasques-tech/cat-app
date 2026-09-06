ALTER TABLE "EnrollmentRequest"
ADD COLUMN "duplicateCheckStatus" TEXT,
ADD COLUMN "duplicateCheckNotes" TEXT,
ADD COLUMN "duplicateReviewedAt" TIMESTAMP(3);
