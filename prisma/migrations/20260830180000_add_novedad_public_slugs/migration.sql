ALTER TABLE "Novedad" ADD COLUMN "slug" TEXT;

WITH normalized AS (
  SELECT
    "id",
    NULLIF(
      regexp_replace(
        regexp_replace(
          translate(lower("title"), 'áéíóúüñ', 'aeiouun'),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        '(^-+|-+$)',
        '',
        'g'
      ),
      ''
    ) AS base_slug
  FROM "Novedad"
),
ranked AS (
  SELECT
    "id",
    base_slug,
    row_number() OVER (PARTITION BY base_slug ORDER BY "id") AS duplicate_position
  FROM normalized
)
UPDATE "Novedad" AS novedad
SET "slug" = CASE
  WHEN ranked.base_slug IS NULL THEN 'novedad-' || left(novedad."id", 8)
  WHEN ranked.duplicate_position = 1 THEN ranked.base_slug
  ELSE ranked.base_slug || '-' || left(novedad."id", 8)
END
FROM ranked
WHERE novedad."id" = ranked."id";

ALTER TABLE "Novedad" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Novedad_slug_key" ON "Novedad"("slug");
