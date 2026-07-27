path = "api/analyze.ts"
content = open(path).read()

old1 = "    const { action = 'full_analysis', content, industry, sentence, title, module } = req.body as any;"
new1 = "    const { action = 'full_analysis', content, industry, sentence, title, module, lane } = req.body as any;"
c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """      const saveResult = await incrementUsageAndSaveAnalysis(user.id, {
        overall_score: result.overallScore ?? null,
        ai_readability: result.pillarScores?.aiReadability ?? null,
        digital_authority: result.pillarScores?.digitalAuthority ?? null,
        conversion_readiness: result.pillarScores?.conversionReadiness ?? null,
        product_discoverability: result.pillarScores?.productDiscoverability ?? null,
        rag_readiness: result.pillarScores?.ragReadiness ?? null,
        result_json: result,
      });"""
new2 = """      const saveResult = await incrementUsageAndSaveAnalysis(user.id, {
        overall_score: result.overallScore ?? null,
        ai_readability: result.pillarScores?.aiReadability ?? null,
        digital_authority: result.pillarScores?.digitalAuthority ?? null,
        conversion_readiness: result.pillarScores?.conversionReadiness ?? null,
        product_discoverability: result.pillarScores?.productDiscoverability ?? null,
        rag_readiness: result.pillarScores?.ragReadiness ?? null,
        result_json: result,
        lane: typeof lane === 'string' ? lane : null,
      });"""
c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

open(path, "w").write(content)
print("Patched", path)
