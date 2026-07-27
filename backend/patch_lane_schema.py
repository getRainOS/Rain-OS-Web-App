path = "services/dbSetup.ts"
content = open(path).read()

old = """-- Additive migration for existing deployments (idempotent)
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS rag_readiness NUMERIC;

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_analyzed_at
  ON content_analyses(user_id, analyzed_at DESC);"""

new = """-- Additive migration for existing deployments (idempotent)
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS rag_readiness NUMERIC;
ALTER TABLE content_analyses ADD COLUMN IF NOT EXISTS lane TEXT;

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_analyzed_at
  ON content_analyses(user_id, analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_analyses_user_lane
  ON content_analyses(user_id, lane);"""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
