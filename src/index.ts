import { ConfigProvider, Effect } from "effect";
import { GrazeClient } from "./GrazeClient.js";

type GrazePromiseApi = Effect.Success<typeof setup>;

export class GrazeService {
  getFeed: GrazePromiseApi["getFeed"];
  getFeeds: GrazePromiseApi["getFeeds"];
  hidePost: GrazePromiseApi["hidePost"];
  unhidePost: GrazePromiseApi["unhidePost"];
  updateAlgorithm: GrazePromiseApi["updateAlgorithm"];
  publishAlgorithm: GrazePromiseApi["publishAlgorithm"];
  stickyposts: {
    get: GrazePromiseApi["getStickyPosts"];
    create: GrazePromiseApi["createStickyPost"];
    delete: GrazePromiseApi["deleteStickyPost"];
    update: GrazePromiseApi["updateStickyPost"];
  };

  constructor({
    apiUrl,
    cookie,
    userId,
  }: {
    apiUrl: string;
    cookie: string;
    userId: number;
  }) {
    const envMap = new Map([
      ["GRAZE_API_URL", apiUrl],
      ["GRAZE_COOKIE", cookie],
      ["GRAZE_USER_ID", userId.toString()],
    ]);
    const provider = ConfigProvider.make((path) => {
      const value = envMap.get(path.join("."));
      return Effect.succeed(
        value !== undefined ? ConfigProvider.makeValue(value) : undefined,
      );
    });
    const layer = ConfigProvider.layer(provider);
    const make = setup.pipe(
      Effect.provide(GrazeClient.layer),
      Effect.provide(layer),
    );
    const api = Effect.runSync(make);
    this.getFeed = api.getFeed;
    this.getFeeds = api.getFeeds;
    this.hidePost = api.hidePost;
    this.unhidePost = api.unhidePost;
    this.updateAlgorithm = api.updateAlgorithm;
    this.publishAlgorithm = api.publishAlgorithm;
    this.stickyposts = {
      get: api.getStickyPosts,
      create: api.createStickyPost,
      delete: api.deleteStickyPost,
      update: api.updateStickyPost,
    };
  }
}

const setup = Effect.gen(function* () {
  const client = yield* GrazeClient;
  const getFeed = (
    ...args: Parameters<typeof client.getFeed<"decoded-only">>
  ) => client.getFeed(...args).pipe(Effect.runPromise);
  const getFeeds = (...args: Parameters<typeof client.getFeeds>) =>
    client.getFeeds(...args).pipe(Effect.runPromise);
  const hidePost = (
    ...args: Parameters<typeof client.hidePost<"decoded-only">>
  ) => client.hidePost(...args).pipe(Effect.runPromise);
  const unhidePost = (
    ...args: Parameters<typeof client.unhidePost<"decoded-only">>
  ) => client.unhidePost(...args).pipe(Effect.runPromise);
  const updateAlgorithm = (
    ...args: Parameters<typeof client.updateAlgorithm>
  ) => client.updateAlgorithm(...args).pipe(Effect.runPromise);
  const publishAlgorithm = (
    ...args: Parameters<typeof client.publishAlgorithm<"decoded-only">>
  ) => client.publishAlgorithm(...args).pipe(Effect.runPromise);
  const getStickyPosts = (
    ...args: Parameters<typeof client.stickyposts.get<"decoded-only">>
  ) => client.stickyposts.get(...args).pipe(Effect.runPromise);
  const createStickyPost = (
    ...args: Parameters<typeof client.stickyposts.create<"decoded-only">>
  ) => client.stickyposts.create(...args).pipe(Effect.runPromise);
  const deleteStickyPost = (
    ...args: Parameters<typeof client.stickyposts.delete<"decoded-only">>
  ) => client.stickyposts.delete(...args).pipe(Effect.runPromise);
  const updateStickyPost = (
    ...args: Parameters<typeof client.stickyposts.update<"decoded-only">>
  ) => client.stickyposts.update(...args).pipe(Effect.runPromise);

  return {
    getFeed,
    getFeeds,
    hidePost,
    unhidePost,
    updateAlgorithm,
    publishAlgorithm,
    getStickyPosts,
    createStickyPost,
    deleteStickyPost,
    updateStickyPost,
  };
});

export { Algo, F } from "./builder.js";
export * from "./schema/index.js";
