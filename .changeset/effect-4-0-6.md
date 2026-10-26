---
"graze-client": minor
---

Built and tested with `effect@4.0.6`. The peer dependency is now `effect@~4.0.6`. The declarations spell out the client's endpoint and method types as the Effect version they were built against defines them, and 4.0.6 changed those types, so 0.11.0's declarations type every call as `unknown` on 4.0.6 and later. The narrower peer range turns that mismatch into a peer warning.
