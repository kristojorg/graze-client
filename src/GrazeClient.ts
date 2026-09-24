import { Config, Context, Data, Effect, Layer, Redacted, Schema } from "effect";
import {
  AlgoUpdateResponse,
  GetAlgoResponse,
  GetAlgorithmsResponse,
  HidePostBody,
  UnhidePostBody,
} from "./schema/shared.js";

import { FeedIdParam, UserIdParam } from "./common.js";
import * as Form from "./schema/UpdateAlgorithmPayload.js";
import { StickyPostsApiGroup } from "./stickyposts.js";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiClient from "effect/unstable/httpapi/HttpApiClient";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";

function isStringOrBlob(val: unknown): val is string | Blob {
  return typeof val === "string" || val instanceof Blob;
}

const encodeForm = (obj: Form.FullForm) =>
  Effect.gen(function* () {
    const encoded = yield* Schema.encodeEffect(Form.FullForm)(obj);
    const formData = new FormData();
    for (const key in encoded) {
      if (Object.prototype.hasOwnProperty.call(encoded, key)) {
        const val = encoded[key as keyof Form.FullForm];
        if (isStringOrBlob(val)) {
          formData.append(key, val);
        }
      }
    }
    return formData;
  });

const GrazeApiGroup = HttpApiGroup.make("graze", { topLevel: true })
  .add(
    HttpApiEndpoint.get("getFeeds", "/app/my_feeds", {
      // v3 GET `setPayload` serialised to query params (GET has no body); v4
      // expresses that as `query`.
      query: Schema.Struct({
        user_id: UserIdParam,
      }),
      success: GetAlgorithmsResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("getFeed", "/app/my_feeds/:feedId", {
      params: { feedId: FeedIdParam },
      success: GetAlgoResponse,
    }),
  )
  .add(
    HttpApiEndpoint.post("updateAlgorithm", "/app/edit_algo_image", {
      payload: Form.FullForm.pipe(HttpApiSchema.asMultipart()),
      success: AlgoUpdateResponse,
    }),
  )
  .add(
    HttpApiEndpoint.get("publishAlgorithm", "/app/publish_algo/:feedId", {
      params: { feedId: FeedIdParam },
      success: Schema.Unknown,
    }),
  )
  .add(
    HttpApiEndpoint.post("hidePost", "/app/hide_post", {
      payload: HidePostBody,
      success: Schema.Unknown,
    }),
  )
  .add(
    HttpApiEndpoint.post("unhidePost", "/app/unhide_post", {
      payload: UnhidePostBody,
      success: Schema.Unknown,
    }),
  );

class GrazeApiDef extends HttpApi.make("grazeApi")
  .add(GrazeApiGroup)
  .add(StickyPostsApiGroup) {}

const grazeLive = Effect.gen(function* () {
  const baseUrl = yield* Config.URL("GRAZE_API_URL");
  const cookie = yield* Config.Redacted("GRAZE_COOKIE");

  const client = yield* HttpApiClient.make(GrazeApiDef, {
    baseUrl: baseUrl.toString(),
    transformClient: (client) =>
      client.pipe(
        HttpClient.filterStatusOk,
        HttpClient.mapRequest(
          HttpClientRequest.setHeaders({
            cookie: Redacted.value(cookie),
          }),
        ),
      ),
  });

  const updateAlgorithm = (data: Form.FullForm) =>
    Effect.gen(function* () {
      const formData = yield* encodeForm(data);
      return yield* client.updateAlgorithm({ payload: formData });
    });

  const userId = yield* Config.Int("GRAZE_USER_ID");
  const getFeeds = () => client.getFeeds({ query: { user_id: userId } });

  return {
    ...client,
    updateAlgorithm,
    getFeeds,
  };
});

export class GrazeClient extends Context.Service<
  GrazeClient,
  Effect.Success<typeof grazeLive>
>()("GrazeClient") {
  static readonly layer = Layer.effect(GrazeClient, grazeLive).pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}

/** The resolved service shape (v4 has no `.Service` namespace on the tag). */
export type GrazeClientService = Effect.Success<typeof grazeLive>;

export class GrazeError extends Data.TaggedError("GrazeError")<{
  message: string;
  status: number;
  statusText: string;
  json: unknown;
}> {}
