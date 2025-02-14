import { ConfigProvider, Effect, Layer } from "effect";
import { GrazeClient } from "./GrazeClient.js";

type Promisify<T> = T extends (
  ...args: any[]
) => Effect.Effect<infer A, infer E, never>
  ? (...args: Parameters<T>) => Promise<A>
  : never;

export class GrazeService {
  getFeed: Promisify<typeof GrazeClient.Service.getFeed>;
  getFeeds: Promisify<typeof GrazeClient.Service.getFeeds>;
  hidePost: Promisify<typeof GrazeClient.Service.hidePost>;
  updateAlgorithm: Promisify<typeof GrazeClient.Service.updateAlgorithm>;
  publishAlgorithm: Promisify<typeof GrazeClient.Service.publishAlgorithm>;

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
    const provider = ConfigProvider.fromMap(envMap);
    const layer = Layer.setConfigProvider(provider);
    const make = setup.pipe(
      Effect.provide(GrazeClient.Default),
      Effect.provide(layer)
    );
    const api = Effect.runSync(make);
    this.getFeed = api.getFeed;
    this.getFeeds = api.getFeeds;
    this.hidePost = api.hidePost;
    this.updateAlgorithm = api.updateAlgorithm;
    this.publishAlgorithm = api.publishAlgorithm;
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
  const updateAlgorithm = (
    ...args: Parameters<typeof client.updateAlgorithm>
  ) => client.updateAlgorithm(...args).pipe(Effect.runPromise);
  const publishAlgorithm = (
    ...args: Parameters<typeof client.publishAlgorithm>
  ) => client.publishAlgorithm(...args).pipe(Effect.runPromise);

  return {
    getFeed,
    getFeeds,
    hidePost,
    updateAlgorithm,
    publishAlgorithm,
  };
});

export * from "./schema/index.js";
export { F, Algo } from "./builder.js";
