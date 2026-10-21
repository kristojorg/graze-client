import { afterEach, describe, expect, it, vi } from "@effect/vitest";
import { ConfigProvider, Effect, Layer } from "effect";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import { GrazeClient } from "../src/GrazeClient.js";
import { GrazeService } from "../src/index.js";
import type { GetAlgorithmsResponse } from "../src/schema/index.js";

const algorithm = {
  algorithm_uri: "at://did:plc:graze/app.bsky.feed.generator/cycling",
  algorithm_manifest_id: 7,
  draft_algorithm_manifest_id: 7,
  record_name: "cycling",
  display_name: "Cycling",
  description: "Pro cycling",
  feed_did: "did:web:api.graze.social",
  avatar_url: null,
  cpm_cents: null,
  deleted: false,
  active: true,
  public: true,
  monetization_available: false,
  status: null,
  unique_operator_ids: [1],
  user_id: 1,
  id: 42,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-02-01T00:00:00.000Z",
  deleted_at: null,
};

const responses: Record<string, unknown> = {
  "/app/my_feeds": {
    page: 1,
    page_size: 20,
    total_items: 1,
    total_pages: 1,
    user_algos: [
      {
        ...algorithm,
        stats: { page_renders: 10, unique_users: 3, post_renders: 30 },
      },
    ],
  },
  "/app/my_feeds/42": JSON.stringify({
    ...algorithm,
    stats: null,
    latest_error: null,
    latest_compute_cycle: null,
    subscriber_lists: null,
    draft_algorithm_manifest: null,
    algorithm_manifest: null,
  }),
  "/app/api/v1/feed-management/sticky-posts/42": { sticky_posts: [] },
};

const requests: Array<string> = [];
const fakeGraze: typeof globalThis.fetch = (input) => {
  const url = new URL(String(input));
  requests.push(url.toString());
  return Promise.resolve(Response.json(responses[url.pathname]));
};

const config = {
  GRAZE_API_URL: "https://api.graze.test",
  GRAZE_COOKIE: "session=test",
  GRAZE_USER_ID: "1",
};

const ClientLive = GrazeClient.layer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown(config))),
);

const feedName = (response: GetAlgorithmsResponse, feedId: number) =>
  response.user_algos.find((algo) => algo.id === feedId)?.display_name ??
  `Unknown feed ${feedId}`;

const listFeeds = (client: GrazeClient["Service"]) =>
  Effect.map(client.getFeeds(), (response) =>
    response.user_algos.map((algo) => ({
      id: algo.id,
      name: feedName(response, algo.id),
      published:
        algo.algorithm_manifest_id === algo.draft_algorithm_manifest_id,
      updatedAt: algo.updated_at.toISOString(),
      uniqueUsers: algo.stats.unique_users,
    })),
  );

afterEach(() => {
  requests.length = 0;
  vi.unstubAllGlobals();
});

describe("GrazeClient", () => {
  it.effect("endpoint calls succeed with the decoded response", () =>
    Effect.gen(function* () {
      const client = yield* GrazeClient;
      const feeds = yield* listFeeds(client);
      const { sticky_posts } = yield* client.stickyposts.get({
        params: { feedId: 42 },
      });
      expect(feeds).toEqual([
        {
          id: 42,
          name: "Cycling",
          published: true,
          updatedAt: "2026-02-01T00:00:00.000Z",
          uniqueUsers: 3,
        },
      ]);
      expect(sticky_posts).toEqual([]);
      expect(requests).toEqual([
        "https://api.graze.test/app/my_feeds?user_id=1",
        "https://api.graze.test/app/api/v1/feed-management/sticky-posts/42",
      ]);
    }).pipe(
      Effect.provideService(FetchHttpClient.Fetch, fakeGraze),
      Effect.provide(ClientLive),
    ),
  );
});

describe("GrazeService", () => {
  it("resolves with the decoded response", async () => {
    vi.stubGlobal("fetch", fakeGraze);
    const graze = new GrazeService({
      apiUrl: config.GRAZE_API_URL,
      cookie: config.GRAZE_COOKIE,
      userId: 1,
    });
    const response = await graze.getFeeds();
    const feed = await graze.getFeed({ params: { feedId: 42 } });
    const { sticky_posts } = await graze.stickyposts.get({
      params: { feedId: 42 },
    });
    expect(feedName(response, feed.id)).toBe("Cycling");
    expect(feed.updated_at).toEqual(new Date("2026-02-01T00:00:00.000Z"));
    expect(sticky_posts).toEqual([]);
  });
});
