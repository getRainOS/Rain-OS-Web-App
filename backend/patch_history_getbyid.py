path = "api/history.ts"
with open(path, "r") as f:
    content = f.read()

anchor = "export async function deleteHandler(req: express.Request, res: express.Response) {"
assert content.count(anchor) == 1, f"Expected 1 match, found {content.count(anchor)}"

new_handler = '''export async function getByIdHandler(req: express.Request, res: express.Response) {
  const apiKey = getApiKey(req);
  if (!apiKey) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key missing' } as ApiError);
  }
  const user = await findUserByApiKey(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' } as ApiError);
  }

  const idRaw = req.params.id;
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'bad_request', message: 'id must be a positive integer' } as ApiError);
  }

  try {
    const item = await getAnalysisById(user.id, id);
    if (!item) {
      return res.status(404).json({ error: 'not_found', message: 'Analysis not found' } as ApiError);
    }
    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('History getById error:', error);
    const msg = error instanceof Error ? error.message : 'Internal error';
    return res.status(500).json({ error: 'internal_server_error', message: msg } as ApiError);
  }
}

''' + anchor

content = content.replace(anchor, new_handler, 1)

# Add getAnalysisById to the existing dbService import
old_import_marker = "getAnalysesByUser"
assert content.count(old_import_marker) >= 1, "Could not find dbService import to extend"
content = content.replace("getAnalysesByUser", "getAnalysesByUser, getAnalysisById", 1)

with open(path, "w") as f:
    f.write(content)

print("history.ts patched successfully: getByIdHandler added.")
