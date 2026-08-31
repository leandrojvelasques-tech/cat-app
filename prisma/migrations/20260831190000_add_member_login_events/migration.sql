CREATE TABLE "MemberLoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberLoginEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MemberLoginEvent_loggedAt_idx" ON "MemberLoginEvent"("loggedAt");
CREATE INDEX "MemberLoginEvent_userId_loggedAt_idx" ON "MemberLoginEvent"("userId", "loggedAt");

ALTER TABLE "MemberLoginEvent" ADD CONSTRAINT "MemberLoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
