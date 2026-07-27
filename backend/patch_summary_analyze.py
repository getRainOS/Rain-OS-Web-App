import re

path = "api/analyze.ts"
with open(path, "r") as f:
    content = f.read()

pattern = re.compile(r"(rag_readiness:\s*result\.pillarScores\?\.ragReadiness\s*\?\?\s*null,)")
matches = pattern.findall(content)
assert len(matches) == 1, f"Expected 1 match, found {len(matches)}"
content = pattern.sub(r"\1\n        summary: result.summary ?? null,", content, count=1)

with open(path, "w") as f:
    f.write(content)

print("api/analyze.ts patched successfully.")
