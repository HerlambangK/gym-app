# Test Status

Last verified in this workspace:

- `npm run test:integration -- --runInBand`: 5 suites, 16 tests passed.
- `npm test -- --runInBand`: 29 suites, 212 tests passed.
- `npm run build`: passed.

Database integration tests print query speed with the `[db-query]` prefix, for example:

```text
[db-query] payments.list: 115.1ms
```

See `TEST_SCENARIOS.md` for the detailed scenario matrix.
