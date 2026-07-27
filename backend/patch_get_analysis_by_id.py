path = "services/dbService.ts"
with open(path, "r") as f:
    content = f.read()

anchor = "export const deleteAnalysis = async ("
assert content.count(anchor) == 1, f"Expected 1 match, found {content.count(anchor)}"

new_function = '''export const getAnalysisById = async (
  userId: string,
  id: number
): Promise<AnalysisRecord | null> => {
  const res = await pool.query(
    `SELECT id, title, url, overall_score, ai_readability, digital_authority,
      conversion_readiness, product_discoverability, rag_readiness,
      summary, analyzed_at, lane, result_json
     FROM content_analyses
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return res.rows[0] ? mapAnalysisRow(res.rows[0]) : null;
};

''' + anchor

content = content.replace(anchor, new_function, 1)

with open(path, "w") as f:
    f.write(content)

print("dbService.ts patched successfully: getAnalysisById added.")
