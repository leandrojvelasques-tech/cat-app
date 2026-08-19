ALTER TABLE "Member" ADD COLUMN "bajaReason" TEXT;
ALTER TABLE "Member" ADD COLUMN "debtStatus" TEXT;

UPDATE "Member"
SET "bajaReason" = CASE
  WHEN "status" = 'DECEASED' THEN 'FALLECIMIENTO'
  WHEN "status" = 'RESIGNED' THEN 'RENUNCIA'
  ELSE NULL
END
WHERE "status" IN ('DECEASED', 'RESIGNED');

UPDATE "Member"
SET "status" = 'ACTIVE', "debtStatus" = 'SUSPENDIDO'
WHERE "status" IN ('INACTIVE', 'ARCHIVED', 'ADMINISTRATIVE');

UPDATE "Member"
SET "debtStatus" = 'EN MORA'
WHERE "status" = 'DEBTOR';

UPDATE "Member"
SET "debtStatus" = 'SUSPENDIDO'
WHERE "status" = 'SUSPENDED';

UPDATE "Member"
SET "status" = 'BAJA'
WHERE "status" IN ('DECEASED', 'RESIGNED');

UPDATE "Member"
SET "debtStatus" = 'AL DIA'
WHERE "type" = 'HONORARIO';
