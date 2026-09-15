@AGENTS.md

## Git workflow (user-confirmed standing rule, 2026-09-15)

This is the only local copy of this project — there is no second clone to keep in
sync. After any file edit made here, commit and push to `origin main` directly,
without asking for confirmation first, unless the change touches the live
database (migrations, data backfills/deletes) — for those, stop and confirm with
the user first, same as before.

Pulling changes *from* GitHub into this machine still requires the user to ask
for it explicitly — never pull automatically.
