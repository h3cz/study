# Pre-Commit Checklist

- Run `npm run lint`.
- Run `npm test`.
- Run `npm run e2e` when browser flows, auth, navigation, or UI states changed.
- Run `npm run build` before marking work complete.
- Confirm no new Supabase table or column references lack a migration or a documented temporary TODO.
- Confirm no ES-target-sensitive convenience APIs were added without checking support.
