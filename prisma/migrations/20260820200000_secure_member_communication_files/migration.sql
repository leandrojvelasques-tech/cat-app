ALTER TABLE "MemberCommunication" ADD COLUMN "storageName" TEXT;

UPDATE "MemberCommunication"
SET "storageName" = regexp_replace("fileUrl", '^.*/', '')
WHERE "storageName" IS NULL;

ALTER TABLE "MemberCommunication" ALTER COLUMN "storageName" SET NOT NULL;
