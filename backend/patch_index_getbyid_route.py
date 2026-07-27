path = "api/index.ts"
with open(path, "r") as f:
    content = f.read()

anchor = "app.delete('/api/history/:id', historyDeleteHandler);"
assert content.count(anchor) == 1, f"Expected 1 match, found {content.count(anchor)}"

new_route = "app.get('/api/history/:id', historyGetByIdHandler);\n" + anchor

content = content.replace(anchor, new_route, 1)

old_import = "import { listHandler as historyListHandler, deleteHandler as historyDeleteHandler } from './history';"
assert content.count(old_import) == 1, f"Expected 1 import match, found {content.count(old_import)}"
new_import = "import { listHandler as historyListHandler, deleteHandler as historyDeleteHandler, getByIdHandler as historyGetByIdHandler } from './history';"
content = content.replace(old_import, new_import, 1)

with open(path, "w") as f:
    f.write(content)

print("index.ts patched successfully: GET /api/history/:id registered.")
