# Supabase Setup

1. Open the Supabase SQL Editor for the gym project.
2. Run `supabase/schema.sql`.
3. Keep real keys in `.env.local`; do not commit them.
4. Check the app connection at `/api/supabase/health`.

Expected health response after the schema is applied:

```json
{
  "connected": true,
  "schemaReady": true
}
```

If `schemaReady` is `false`, the app can reach Supabase but the database tables have not been created yet.
