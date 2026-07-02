# Test Status

Last verified in this workspace:

- `npm run test:integration -- --runInBand`: 5 suites, 16 tests passed.
- `npm test -- --runInBand`: 29 suites, 212 tests passed.
- `npm run build`: passed.
- `npm run test:e2e`: 21 tests passed.

CI/database env behavior:

- `npm run test:integration` needs `SUPABASE_SERVICE_ROLE_KEY` plus `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`.
- If those env vars are absent, DB integration suites are skipped with a `[db-query] skipped: ...` message instead of crashing during Supabase client creation.
- Public E2E pages run in guest mode when Supabase public env is absent; `/pricing` falls back to demo package data when `SUPABASE_DB_URL`/`DATABASE_URL` is absent.
- Playwright uses port `3000` by default. Set `PORT=3100` to run it beside an existing dev server, and set `PLAYWRIGHT_WEB_SERVER_COMMAND` to override the server command when testing production builds.

Database integration tests print query speed with the `[db-query]` prefix, for example:

```text
[db-query] payments.list: 115.1ms
```

See `TEST_SCENARIOS.md` for the detailed scenario matrix.
