ALTER TABLE "Communication" ADD COLUMN "campaignKey" TEXT;
ALTER TABLE "Communication" ADD COLUMN "campaignName" TEXT;
ALTER TABLE "Communication" ADD COLUMN "campaignPeriod" TEXT;

CREATE INDEX "Communication_memberId_type_campaignPeriod_idx"
  ON "Communication"("memberId", "type", "campaignPeriod");

CREATE INDEX "Communication_campaignKey_campaignPeriod_status_idx"
  ON "Communication"("campaignKey", "campaignPeriod", "status");
