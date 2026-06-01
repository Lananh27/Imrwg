DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Project'
      AND column_name = 'content'
  ) THEN
    ALTER TABLE "Project" ADD COLUMN "content" TEXT;
  END IF;
END $$;

ALTER TABLE "Project"
ALTER COLUMN "category" SET DEFAULT 'Research';

UPDATE "Project"
SET "category" = 'Research'
WHERE "category" IS NULL;

ALTER TABLE "Project"
ALTER COLUMN "category" SET NOT NULL;

ALTER TABLE "Project"
ALTER COLUMN "researchArea" SET DEFAULT 'General';

UPDATE "Project"
SET "researchArea" = 'General'
WHERE "researchArea" IS NULL;

ALTER TABLE "Project"
ALTER COLUMN "researchArea" SET NOT NULL;