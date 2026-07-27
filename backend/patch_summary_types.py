import re

path = "types.ts"
with open(path, "r") as f:
    content = f.read()

pattern = re.compile(r"(recommendations:\s*string\[\];)(\s*\n\s*keywords:\s*string\[\];)")
matches = pattern.findall(content)
assert len(matches) == 1, f"Expected 1 match, found {len(matches)}"
content = pattern.sub(r"\1\n  summary: string;\2", content, count=1)

with open(path, "w") as f:
    f.write(content)

print("types.ts patched successfully.")
