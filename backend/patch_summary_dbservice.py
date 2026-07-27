import re

path = "services/dbService.ts"
with open(path, "r") as f:
    content = f.read()

pattern = re.compile(r"(lane\?:\s*string\s*\|\s*null;)(\s*\n\})")
matches = pattern.findall(content)
assert len(matches) == 1, f"Expected 1 match, found {len(matches)}"
content = pattern.sub(r"\1\n  summary?: string | null;\2", content, count=1)

with open(path, "w") as f:
    f.write(content)

print("dbService.ts patched successfully.")
