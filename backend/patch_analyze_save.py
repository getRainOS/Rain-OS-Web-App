path = "api/analyze.ts"
content = open(path).read()

old1 = "import { findUserByApiKey, incrementUserUsage } from '../services/dbService';"
new1 = "import { findUserByApiKey, incrementUserUsage, incrementUsageAndSaveAnalysis } from '../services/dbService';"
c1 = content.count(old1)
assert c1 == 1, f"anchor1: expected 1, found {c1}"
content = content.replace(old1, new1)

old2 = """    const updatedUser = await incrementUserUsage(user.id);
    if (updatedUser) {
      res.setHeader('X-Usage-Info', JSON.stringify(updatedUser.usage));
    }

    return res.status(200).json({ success: true, data: result, ...result });"""
new2 = """    let updatedUser;
    if (action === 'full_analysis' && result) {
      const saveResult = await incrementUsageAndSaveAnalysis(user.id, {
        overall_score: result.overallScore ?? null,
        ai_readability: result.pillarScores?.aiReadability ?? null,
        digital_authority: result.pillarScores?.digitalAuthority ?? null,
        conversion_readiness: result.pillarScores?.conversionReadiness ?? null,
        product_discoverability: result.pillarScores?.productDiscoverability ?? null,
        rag_readiness: result.pillarScores?.ragReadiness ?? null,
        result_json: result,
      });
      updatedUser = saveResult.updatedUser;
    } else {
      updatedUser = await incrementUserUsage(user.id);
    }
    if (updatedUser) {
      res.setHeader('X-Usage-Info', JSON.stringify(updatedUser.usage));
    }

    return res.status(200).json({ success: true, data: result, ...result });"""
c2 = content.count(old2)
assert c2 == 1, f"anchor2: expected 1, found {c2}"
content = content.replace(old2, new2)

open(path, "w").write(content)
print("Patched", path)
