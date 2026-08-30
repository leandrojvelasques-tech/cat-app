CREATE TABLE "NovedadAttachment" (
    "id" TEXT NOT NULL,
    "novedadId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageName" TEXT NOT NULL,
    "fileMimeType" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NovedadAttachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NovedadMailing" (
    "id" TEXT NOT NULL,
    "novedadId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NovedadMailing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NovedadAttachment_novedadId_idx" ON "NovedadAttachment"("novedadId");
CREATE UNIQUE INDEX "NovedadMailing_novedadId_memberId_key" ON "NovedadMailing"("novedadId", "memberId");
CREATE INDEX "NovedadMailing_novedadId_status_idx" ON "NovedadMailing"("novedadId", "status");

ALTER TABLE "NovedadAttachment" ADD CONSTRAINT "NovedadAttachment_novedadId_fkey" FOREIGN KEY ("novedadId") REFERENCES "Novedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NovedadMailing" ADD CONSTRAINT "NovedadMailing_novedadId_fkey" FOREIGN KEY ("novedadId") REFERENCES "Novedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NovedadMailing" ADD CONSTRAINT "NovedadMailing_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
