import re

path = "services/geminiService.ts"
with open(path, "r") as f:
    content = f.read()

old = "'Return your scores as a single JSON object matching this exact shape (all fields required):',"
assert content.count(old) == 1, f"Expected 1 match, found {content.count(old)}"

new = (
    "'IMPORTANT: The \"recommendations\" array must contain 3-5 specific, actionable fixes tied to the lowest-scoring subcategories above (e.g. \"Add a bulleted FAQ answering the top 3 buyer questions\" rather than generic advice like \"improve clarity\"). Never return an empty array — every piece of content has room for at least one concrete improvement.',\n"
    "  'Return your scores as a single JSON object matching this exact shape (all fields required):',"
)

content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)

print("Patch applied successfully.")
