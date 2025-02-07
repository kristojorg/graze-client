# Graze Client

This is a simple Typescript package for interacting with the [Graze](https://graze.social/) API. The API is undocumented and not officially supported, but this package was made with their blessing.

```bash
npm install graze-client
```

## Features

1. **getFeeds:** Get all your graze feeds.
1. **getFeed:** Get a specific feed.
1. **hidePost:** Hide a post from a feed.
1. **updateAlgorithm:** Update an algorithm.
1. **publishAlgorithm:** Publish an algorithm.
1. **Algorithm Builder:** A custom utility to make building an algorithm easier. See the example below.

### This is a WIP

This package is under development, so if you find bugs, please report. Known issues include:

1. Not all graze operators or APIs are implemented. I have only implemented what I need so far, so feed free to make a PR adding more.
2. Not everything is documented, but typescript is your friend. It you use this in an editor like VSCode, you should get good autocomplete hints for types.

## Usage

**Authentication** is currently cookie-based and a little hacky. You will need to log into Graze in your browser, then copy the cookie from your browser's developer tools, and pass it as a string to the `GrazeService`.

There are two exports:

### 1. A promise-based `GrazeService`

```ts
import { GrazeService, F, Algo, FullForm } from "graze-client";

const graze = new GrazeService({
  apiUrl: "https://api.graze.social",
  cookie: "<change this>",
  userId: 15,
});

// get feets
const myFeeds = await graze.getFeeds();
const feed = await graze.getFeed({ path: { feedId: 1234 } });
// hide a post
await graze.hidePost({
  payload: { algo_id: 1234, at_uri: "at://<did>/app.bsky.feed.post/<rkey>" },
});

// build a complex algorithm

const hasNoBadContent = F.and(
  F.isContentOk(0.9),
  F.hasNoNSFWLabels,
  F.isNotListMember("my-blocklist-url")
);

const algo = Algo.filter(
  // the top level filter will combine elements in an "and" block
  hasNoBadContent,
  F.hasVideo,
  F.or(
    F.posterFollows("@samuel.bsky.team"),
    F.isListMember("my-whitelist-url"),
    F.and(
      F.regexMatches("text", "my-keyword-regex"),
      F.regexMatches("embed.alt", "my-keyword-regex"),
      F.regexMatches("embed.external.title", "my-keyword-regex"),
      F.regexMatches("embed.external.description", "my-keyword-regex"),
      F.isPost
    ),
    F.or(
      // nested logic blocks will be automatically flattened, so this will
      // be brought up one level since it is logically equivalent.
      F.regexNegationMatches("text", "my-negative-keyword-regex")
    )
  )
);

const manifest: FullForm = {
  algorithm_manifest: algo,
  id: 12,
  user_id: 1,
  display_name: "My Fancy Feed",
  // file:  add a file blob here to update the image
  description: "This is a fancy feed with lots of logic for fun and profit.",
  order: "new",
  // CAUTION: this will change the feed slug and cause you to lose existing follows.
  // but if you do it, don't worry you can set it back and it will be fixed : ).
  record_name: "my-fancy-feed",
};

// send the algorithm to graze
const response = await graze.updateAlgorithm(manifest);
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
