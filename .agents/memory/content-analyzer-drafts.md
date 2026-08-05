---
name: Content analyzer draft persistence
description: Durable rules for preserving content in the analyzer across analysis, refreshes, and route changes.
---

The content analyzer must treat the editor draft as user-owned state, separate from analysis results. Persist the title, content, and URL in browser storage while the user edits, carry the submitted values through analysis route transitions, and restore them after refreshes.

**Why:** Analysis history may contain older records without raw content, and an empty or missing server `content` field must never erase text the user has already entered.

**How to apply:** When loading an analysis, only hydrate the editor from a non-empty persisted content value. Keep browser-draft restoration and server-history restoration scoped so opening one saved analysis cannot display another analysis's draft.