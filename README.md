# Graze Client

This is a simple Typescript package for interacting with the [Graze](https://graze.social/) API. The API is undocumented and not officially supported, but this package was made with their blessing.

```bash
npm install graze-client
```

It is a bit hastily put together and under development (not all APIs are implemented), but it works. There currently is no bundled code, it is just source Typescript code. You may need to configure your build system or bundler to bundle this for you. If you are using this in a Node.js environment, you can use [tsx](https://github.com/esbuild-kit/tsx) to run the typescript code like regular JS, or you can use [bun](https://bun.sh/).

There are two exports:

### 1. A promise-based `GrazeService`

```ts
import { GrazeService } from "graze-client";

const graze = new GrazeService({
  apiUrl: "https://api.graze.social",
  cookie: "my-graze-cookie",
  userId: 15,
});

const myFeeds = await graze.getFeeds();
const feed = await graze.getFeed({ path: { feedId: 1234 } });
// hide a post
await graze.hidePost({
  payload: { algo_id: 1234, at_uri: "at://<did>/app.bsky.feed.post/<rkey>" },
});
// update an algorithm
const hasVideo: Form.Filter = {
  embed_type: ["==", "video"],
};
const hasKeyword: Form.Filter = {
  regex_matches: ["text", /Hello World!/.source, true],
};
const res = await graze.updateAlgorithm({
  record_name: "my-feed",
  display_name: "My Feed",
  user_id: 1,
  order: "new",
  id: 1234,
  algorithm_manifest: {
    filter: { and: [hasVideo, hasKeyword] },
  },
});

// publish the algorithm
const res = await graze.publishAlgorithm({ path: { feedId: 1234 } });
```

### 2. An [Effect](https://effect.website/) based `GrazeClient`

This package is build with [Effect](https://effect.website/). One feature of Effect is the ability to generate typesafe API clients with input/output validation. The `GrazeClient` is an Effect service for performing API requests. A benefit of using Effect is that errors will be typed in addition to success cases.

In the below example, the `updateAlgo` effect has the type: `Effect.Effect<void, HttpApiDecodeError | HttpClientError | ParseError, GrazeClient>`, meaning the success value is `void`, the possible errors are `HttpApiDecodeError | HttpClientError | ParseError`, and the effect requires a `GrazeClient` to run.

```ts
const updateAlgo = Effect.gen(function* () {
  const client = yield* GrazeClient;

  const res = yield* client.updateAlgorithm({
    record_name: "my-feed",
    display_name: "My Feed",
    user_id: 1,
    order: "new",
    id: 1234,
    algorithm_manifest: {
      filter: {
        and: [
          {
            regex_matches: ["text", /Hello World!/.source, true],
          },
        ],
      },
    },
  });
});
```

If you're interested, I recommend reading more in the [Effect](https://effect.website/) docs.

# To do

- [ ] Organize schema to provide more useful type exports
- [ ] Add additional filter blocks to `UpdateAlgorithmPayload` schema.
- [ ] Add API to create a feed.
