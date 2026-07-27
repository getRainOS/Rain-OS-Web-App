import re

path = "services/geminiService.ts"
with open(path, "r") as f:
    content = f.read()

# 1. Add `summary` field to RESPONSE_SCHEMA (used both as error fallback and prompt shape example)
pattern1 = re.compile(r"(recommendations:\s*\[\],)(\s*\n\s*keywords:\s*\[\],)")
matches1 = pattern1.findall(content)
assert len(matches1) == 1, f"Pattern 1: expected 1 match, found {len(matches1)}"
content = pattern1.sub(r"\1\n  summary: '',\2", content, count=1)

# 2. Add prompt instruction for summary, right after the existing recommendations instruction
anchor = "Never return an empty array — every piece of content has room for at least one concrete improvement.',"
assert content.count(anchor) == 1, f"Pattern 2: expected 1 match, found {content.count(anchor)}"
new_instruction = (
    anchor + "\n"
    "  'IMPORTANT: The \"summary\" field must be a concise 1-2 sentence overview of what this content is about and its overall AEO readiness, written in plain language for a non-technical reader.',"
)
content = content.replace(anchor, new_instruction, 1)

# 3. Add `summary` to the parsed return object, next to the existing recommendations parsing line
pattern3 = re.compile(r"(recommendations:\s*Array\.isArray\(parsed\.recommendations\)\s*\?\s*parsed\.recommendations\s*:\s*\[\],)")
matches3 = pattern3.findall(content)
assert len(matches3) == 1, f"Pattern 3: expected 1 match, found {len(matches3)}"
content = pattern3.sub(r"\1\n      summary: typeof parsed.summary === 'string' ? parsed.summary : '',", content, count=1)

with open(path, "w") as f:
    f.write(content)

print("geminiService.ts patched successfully: 3 edits applied.")
