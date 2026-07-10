path = "services/geminiService.ts"
content = open(path).read()

old = """generationConfig: {
temperature: 0.1, // low temp for consistent scoring
// 8192 — first bumped 2048→4096 was still truncating on long, footnote-
// heavy articles (large recommendations/keywords arrays on top of the
// 46+ numeric fields). gemini-2.5-flash supports up to 65,536 output
// tokens and the cap only limits length, not cost, so there's real
// headroom to raise this further if truncation ever recurs.
maxOutputTokens: 8192,
responseMimeType: 'application/json',
},
});
// Step 3.5: Detect truncation before attempting to parse — a MAX_TOKENS
// finish reason means the JSON is guaranteed incomplete, so failing fast
// here gives a much clearer signal than letting JSON.parse throw blind."""

new = """generationConfig: {
temperature: 0.1, // low temp for consistent scoring
// Root cause of the truncation (confirmed it happened even on short
// content, which ruled out "response too long for the schema"):
// gemini-2.5-flash has "thinking" enabled by default with a dynamic
// budget, and those internal reasoning tokens count against the same
// maxOutputTokens cap as the visible JSON response. thinkingBudget: 0
// disables thinking entirely for this call — it's a pure structured
// scoring task with no need for chain-of-thought, so this also cuts
// latency. Kept maxOutputTokens at 8192 as a belt-and-suspenders
// safety margin for the schema itself.
thinkingConfig: { thinkingBudget: 0 },
maxOutputTokens: 8192,
responseMimeType: 'application/json',
},
});
// Step 3.5: Detect truncation before attempting to parse — a MAX_TOKENS
// finish reason means the JSON is guaranteed incomplete, so failing fast
// here gives a much clearer signal than letting JSON.parse throw blind."""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
