-- Add full-text search support for Specialist model

-- Create tsvector column for Russian language full-text search
ALTER TABLE "Specialist" ADD COLUMN "searchVector" tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_specialist_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('russian', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW.specialty, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(NEW."fullDescription", '')), 'C') ||
    setweight(to_tsvector('russian', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(array_to_string(NEW.education, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
CREATE TRIGGER specialist_search_vector_update
BEFORE INSERT OR UPDATE ON "Specialist"
FOR EACH ROW
EXECUTE FUNCTION update_specialist_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX "Specialist_searchVector_idx" ON "Specialist" USING GIN ("searchVector");

-- Update existing records
UPDATE "Specialist" SET "updatedAt" = "updatedAt";
