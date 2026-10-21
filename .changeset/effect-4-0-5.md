---
"graze-client": minor
---

Run on Effect 4.0 stable, built and tested with `effect@4.0.5`. The peer dependency is now `effect@^4.0.0`. The client imports `effect/http` and `effect/http-api`, which replaced `effect/unstable/http` and `effect/unstable/httpapi`. An endpoint call without a `responseMode` again types its success as the decoded value, not as a union with `HttpClientResponse`. The `GrazeService` methods accept only the `decoded-only` response mode, which is the mode their return types describe.
