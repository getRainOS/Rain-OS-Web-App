path = "services/geminiService.ts"
content = open(path).read()

old = """const result = await generateContentWithRetry(model, {
systemInstruction: SYSTEM_INSTRUCTION,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: {
temperature: 0.1, // low temp for consistent scoring
maxOutputTokens: 2048,
responseMimeType: 'application/json',
},
});
const raw = result.response.text();
// Step 4: Parse and validate
let parsed: any;
try {
const clean = raw.replace(/```json|```/g, '').trim();
parsed = JSON.parse(clean);



} catch (e) {
console.error('Gemini response parse error:', raw.slice(0, 500));
throw new Error('Failed to parse Gemini scoring response as JSON');
}"""

new = """const result = await generateContentWithRetry(model, {
systemInstruction: SYSTEM_INSTRUCTION,
contents: [{ role: 'user', parts: [{ text: prompt }] }],
generationConfig: {
temperature: 0.1, // low temp for consistent scoring
// 4096 (not 2048) — this schema has 46+ numeric fields plus free-text
// recommendations/keywords arrays, and was getting silently truncated
// mid-JSON on longer content, which surfaced as a generic parse error
// with no indication that MAX_TOKENS was the actual cause.
maxOutputTokens: 4096,
responseMimeType: 'application/json',
},
});
// Step 3.5: Detect truncation before attempting to parse — a MAX_TOKENS
// finish reason means the JSON is guaranteed incomplete, so failing fast
// here gives a much clearer signal than letting JSON.parse throw blind.
const finishReason = result.response.candidates?.[0]?.finishReason;
if (finishReason === 'MAX_TOKENS') {
console.error('Gemini scoring response truncated (MAX_TOKENS). Raw so far:', result.response.text().slice(0, 500));
throw new Error('Gemini scoring response was truncated (hit max output tokens). Try shorter content or retry.');
}
const raw = result.response.text();
// Step 4: Parse and validate
let parsed: any;
try {
const clean = raw.replace(/```json|```/g, '').trim();
parsed = JSON.parse(clean);



} catch (e) {
console.error('Gemini response parse error:', raw.slice(0, 500));
throw new Error('Failed to parse Gemini scoring response as JSON');
}"""

count = content.count(old)
assert count == 1, f"Expected exactly 1 match, found {count}"
content = content.replace(old, new)
open(path, "w").write(content)
print("Patched", path)
