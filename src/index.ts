import { ConfigProvider, Effect } from "effect";
import { GrazeClient, type GrazeClientService } from "./GrazeClient.js";

type Promisify<T> = T extends (
  ...args: Array<any>
) => Effect.Effect<infer A, infer _E, never>
  ? (...args: Parameters<T>) => Promise<A>
  : never;

export class GrazeService {
  getFeed: Promisify<GrazeClientService["getFeed"]>;
  getFeeds: Promisify<GrazeClientService["getFeeds"]>;
  hidePost: Promisify<GrazeClientService["hidePost"]>;
  unhidePost: Promisify<GrazeClientService["unhidePost"]>;
  updateAlgorithm: Promisify<GrazeClientService["updateAlgorithm"]>;
  publishAlgorithm: Promisify<GrazeClientService["publishAlgorithm"]>;
  stickyposts: {
    get: Promisify<GrazeClientService["stickyposts"]["get"]>;
    create: Promisify<GrazeClientService["stickyposts"]["create"]>;
    delete: Promisify<GrazeClientService["stickyposts"]["delete"]>;
    update: Promisify<GrazeClientService["stickyposts"]["update"]>;
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
  const getFeed = (...args: Parameters<typeof client.getFeed>) =>
    client.getFeed(...args).pipe(Effect.runPromise);
  const getFeeds = (...args: Parameters<typeof client.getFeeds>) =>
    client.getFeeds(...args).pipe(Effect.runPromise);
  const hidePost = (...args: Parameters<typeof client.hidePost>) =>
    client.hidePost(...args).pipe(Effect.runPromise);
  const unhidePost = (...args: Parameters<typeof client.unhidePost>) =>
    client.unhidePost(...args).pipe(Effect.runPromise);
  const updateAlgorithm = (
    ...args: Parameters<typeof client.updateAlgorithm>
  ) => client.updateAlgorithm(...args).pipe(Effect.runPromise);
  const publishAlgorithm = (
    ...args: Parameters<typeof client.publishAlgorithm>
  ) => client.publishAlgorithm(...args).pipe(Effect.runPromise);
  const getStickyPosts = (...args: Parameters<typeof client.stickyposts.get>) =>
    client.stickyposts.get(...args).pipe(Effect.runPromise);
  const createStickyPost = (
    ...args: Parameters<typeof client.stickyposts.create>
  ) => client.stickyposts.create(...args).pipe(Effect.runPromise);
  const deleteStickyPost = (
    ...args: Parameters<typeof client.stickyposts.delete>
  ) => client.stickyposts.delete(...args).pipe(Effect.runPromise);
  const updateStickyPost = (
    ...args: Parameters<typeof client.stickyposts.update>
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
