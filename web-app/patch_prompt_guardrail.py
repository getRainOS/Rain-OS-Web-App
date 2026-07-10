path = "src/pages/RepoAnalysis.jsx"
content = open(path).read()

old = """Please apply these fixes directly to my project. Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make."""

new = """Please make only the specific changes listed below — don't refactor, restructure, or modify any other part of the project, and don't change existing functionality, styling, or content beyond what's needed for each fix.

Where you need to create new files, generate the content and tell me which files to create. Where existing files need edits, show me the exact changes to make."""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
