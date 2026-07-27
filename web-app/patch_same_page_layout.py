import re

path = "src/pages/ContentAnalyzer.jsx"
with open(path, "r") as f:
    content = f.read()

# 1. Remove the opening ternary condition - form always renders now
old1 = "{!result ? ("
assert content.count(old1) == 1, f"Edit 1: expected 1 match, found {content.count(old1)}"
content = content.replace(old1, "{", 1)

# 2. Replace the ternary's "else" branch with a conditional AND - results render only when result exists
old2 = ") : (\n        <div className={styles.results}>"
assert content.count(old2) == 1, f"Edit 2: expected 1 match, found {content.count(old2)}"
new2 = "}\n      {result && (\n        <div className={styles.results}>"
content = content.replace(old2, new2, 1)

# 3. Relabel submit button to "Re-analyze" once a result exists
old3 = "{loading ? <><span className=\"spinner\" /> Analyzing\u2026</> : '\u2726 Analyze Content'}"
assert content.count(old3) == 1, f"Edit 3: expected 1 match, found {content.count(old3)}"
new3 = "{loading ? <><span className=\"spinner\" /> {result ? 'Re-analyzing\u2026' : 'Analyzing\u2026'}</> : (result ? '\u21bb Re-analyze' : '\u2726 Analyze Content')}"
content = content.replace(old3, new3, 1)

with open(path, "w") as f:
    f.write(content)

print("ContentAnalyzer.jsx patched successfully: 3 edits applied.")
