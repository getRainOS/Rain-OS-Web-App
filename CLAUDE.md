# CLAUDE.md

## Working rules

1. Before editing, locate the relevant code and report file + line numbers.
2. Show `git diff` before every commit; one commit per fix.
3. Push to a new branch. No PRs unless explicitly asked.
4. Always push with an explicit remote and branch (`git push origin <branch>`). `gitsafe-backup` is NOT the deploy remote.
5. Run `git pull origin main` before starting work, since other Claude Code sessions also push to this repo.
6. Test baseline is 250/250 (`cd backend && npm test`). Report any change.
7. Never print the values of environment variables or secrets.
