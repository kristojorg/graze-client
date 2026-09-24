---
"graze-client": minor
---

Run on Effect `4.0.0-rc.116`: `GrazeClient` reads its config with `Config.URL`, `Config.Redacted` and `Config.Int`, which replaced the lowercase constructors. The peer dependency is now `effect@^4.0.0-rc.116`. `graze-client/schema` also exports the sticky-post schemas.
