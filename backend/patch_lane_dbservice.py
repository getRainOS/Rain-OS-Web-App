path = "services/dbService.ts"
content = open(path).read()

old1 = """export interface AnalysisData {
    overall_score?: number | null;
    ai_readability?: number | null;
    digital_authority?: number | null;
    conversion_readiness?: number | null;
    product_discoverability?: number | null;
    rag_readiness?: number | null;
    result_json?: any;
}"""
new1 = """export interface AnalysisData {
    overall_score?: number | null;
    ai_readability?: number | null;
    digital_authority?: number | null;
    conversion_readiness?: number | null;
    product_discoverability?: number | null;
    rag_readiness?: number | null;
    result_json?: any;
    lane?: string | null;
}"""
c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """        const analysisRes = await client.query(
            `INSERT INTO content_analyses
               (user_id, title, url, overall_score, ai_readability, digital_authority,
                conversion_readiness, product_discoverability, rag_readiness, summary, result_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
                userId,
                null, // title
                null, // url
                analysisData.overall_score ?? null,
                analysisData.ai_readability ?? null,
                analysisData.digital_authority ?? null,
                analysisData.conversion_readiness ?? null,
                analysisData.product_discoverability ?? null,
                analysisData.rag_readiness ?? null,
                null, // summary
                analysisData.result_json ? JSON.stringify(analysisData.result_json) : null,
            ]
        );"""
new2 = """        const analysisRes = await client.query(
            `INSERT INTO content_analyses
               (user_id, title, url, overall_score, ai_readability, digital_authority,
                conversion_readiness, product_discoverability, rag_readiness, summary, result_json, lane)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
                userId,
                null, // title
                null, // url
                analysisData.overall_score ?? null,
                analysisData.ai_readability ?? null,
                analysisData.digital_authority ?? null,
                analysisData.conversion_readiness ?? null,
                analysisData.product_discoverability ?? null,
                analysisData.rag_readiness ?? null,
                null, // summary
                analysisData.result_json ? JSON.stringify(analysisData.result_json) : null,
                analysisData.lane ?? null,
            ]
        );"""
c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

old3 = """export interface AnalysisRecord {
  id: number;
  title: string | null;
  url: string | null;
  overall_score: number | null;
  ai_readability: number | null;
  digital_authority: number | null;
  conversion_readiness: number | null;
  product_discoverability: number | null;
  rag_readiness: number | null;
  summary: string | null;
  analyzed_at: string;
}"""
new3 = """export interface AnalysisRecord {
  id: number;
  title: string | null;
  url: string | null;
  overall_score: number | null;
  ai_readability: number | null;
  digital_authority: number | null;
  conversion_readiness: number | null;
  product_discoverability: number | null;
  rag_readiness: number | null;
  summary: string | null;
  analyzed_at: string;
  lane: string | null;
}"""
c3 = content.count(old3)
assert c3 == 1, f"anchor3: expected 1, found {c3}"
content = content.replace(old3, new3)

old4 = """  summary: row.summary ?? null,
  analyzed_at: row.analyzed_at instanceof Date ? row.analyzed_at.toISOString() : row.analyzed_at,
});"""
new4 = """  summary: row.summary ?? null,
  analyzed_at: row.analyzed_at instanceof Date ? row.analyzed_at.toISOString() : row.analyzed_at,
  lane: row.lane ?? null,
});"""
c4 = content.count(old4)
assert c4 == 1, f"anchor4: expected 1, found {c4}"
content = content.replace(old4, new4)

old5 = """export const getAnalysesByUser = async (
  userId: string,
  limit = 50
): Promise<AnalysisRecord[]> => {
  const res = await pool.query(
    `SELECT id, title, url, overall_score, ai_readability, digital_authority,
            conversion_readiness, product_discoverability, rag_readiness, summary, analyzed_at
     FROM content_analyses
     WHERE user_id = $1
     ORDER BY analyzed_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map(mapAnalysisRow);
};"""
new5 = """export const getAnalysesByUser = async (
  userId: string,
  limit = 50,
  lane?: string | null
): Promise<AnalysisRecord[]> => {
  const laneFilter = lane ? 'AND lane = $3' : '';
  const params = lane ? [userId, limit, lane] : [userId, limit];
  const res = await pool.query(
    `SELECT id, title, url, overall_score, ai_readability, digital_authority,
            conversion_readiness, product_discoverability, rag_readiness, summary, analyzed_at, lane
     FROM content_analyses
     WHERE user_id = $1 ${laneFilter}
     ORDER BY analyzed_at DESC
     LIMIT $2`,
    params
  );
  return res.rows.map(mapAnalysisRow);
};"""
c5 = content.count(old5)
assert c5 == 1, f"anchor5: expected 1, found {c5}"
content = content.replace(old5, new5)

open(path, "w").write(content)
print("Patched", path)
