---
"graze-client": patch
---

The peer dependency is now `effect@^4.0.6`. 4.0.6 is the floor: earlier versions type every call as `unknown` against these declarations. A later Effect release that changes the client types shows up in the consumer's typecheck, so the range no longer stops at the next minor.
