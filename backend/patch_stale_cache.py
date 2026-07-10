path = "services/dbService.ts"
content = open(path).read()

old_wrapper = """const tokenCache = new Map();
const cachedMapRowToUser = (row: any, hashedApiKey?: string) => {
  if (!row) return null;
  if (tokenCache.has(row.id)) return tokenCache.get(row.id);
  const result = mapRowToUser(row, hashedApiKey);
  tokenCache.set(row.id, result);
  return result;
};
"""
count_wrapper = content.count(old_wrapper)
assert count_wrapper == 1, f"wrapper anchor: expected 1, found {count_wrapper}"
content = content.replace(old_wrapper, "")

call_count = content.count("cachedMapRowToUser(")
assert call_count > 0, "Expected at least 1 call site to rename, found 0"
content = content.replace("cachedMapRowToUser(", "mapRowToUser(")

open(path, "w").write(content)
print(f"Patched {path} — removed stale wrapper, renamed {call_count} call site(s) to mapRowToUser().")
