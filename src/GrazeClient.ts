import {
  AlgoUpdateResponse,
  GetAlgoResponse,
  GetAlgorithmsResponse,
  HidePostBody,
  UnhidePostBody,
} from "./schema/shared.js";
import {
  FetchHttpClient,
  HttpApi,
  HttpApiClient,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";
import { Config, Data, Effect, Redacted, Schema } from "effect";

import * as Form from "./schema/UpdateAlgorithmPayload.js";
import {
  CreateStickyPostBody,
  GetStickyPostsBody,
  StickyPostIdParam,
  StickyPostSuccess,
  StickyType,
} from "src/schema/StickyPosts.js";

function isStringOrBlob(val: unknown): val is string | Blob {
  return typeof val === "string" || val instanceof Blob;
}

const encodeForm = (obj: Form.FullForm) =>
  Effect.gen(function* () {
    const encoded = yield* Schema.encode(Form.FullForm)(obj);
    const formData = new FormData();
    for (const key in encoded) {
      if (encoded.hasOwnProperty(key)) {
        const val = encoded[key as keyof Form.FullForm];
        if (isStringOrBlob(val)) {
          formData.append(key, val);
        }
      }
    }
    return formData;
  });

const UserIdParam = HttpApiSchema.param("userId", Schema.NumberFromString);
const FeedIdParam = HttpApiSchema.param("feedId", Schema.NumberFromString);

const GrazeApiGroup = HttpApiGroup.make("graze", { topLevel: true })
  .add(
    HttpApiEndpoint.get("getFeeds")`/app/my_feeds`
      .addSuccess(GetAlgorithmsResponse)
      .setPayload(
        Schema.Struct({
          user_id: UserIdParam,
        })
      )
  )
  .add(
    HttpApiEndpoint.get("getFeed")`/app/my_feeds/${FeedIdParam}`.addSuccess(
      GetAlgoResponse
    )
  )
  .add(
    HttpApiEndpoint.post("updateAlgorithm")`/app/edit_algo_image`
      .setPayload(HttpApiSchema.Multipart(Form.FullForm))
      .addSuccess(AlgoUpdateResponse)
  )
  .add(
    HttpApiEndpoint.get(
      "publishAlgorithm"
    )`/app/publish_algo/${FeedIdParam}`.addSuccess(Schema.Unknown)
  )
  .add(
    HttpApiEndpoint.post("hidePost")`/app/hide_post`
      .setPayload(HidePostBody)
      .addSuccess(Schema.Unknown)
  )
  .add(
    HttpApiEndpoint.post("unhidePost")`/app/unhide_post`
      .setPayload(UnhidePostBody)
      .addSuccess(Schema.Unknown)
  )
  .add(
    HttpApiEndpoint.post(
      "createStickyPost"
    )`/app/api/v1/feed-management/sticky-posts`
      .setPayload(CreateStickyPostBody)
      .addSuccess(StickyPostSuccess)
  )
  .add(
    HttpApiEndpoint.get(
      "getStickyPosts"
    )`/app/api/v1/feed-management/sticky-posts/${FeedIdParam}`.addSuccess(
      GetStickyPostsBody
    )
  )
  .add(
    HttpApiEndpoint.put(
      "updateStickyPost"
    )`/app/api/v1/feed-management/sticky-posts/${FeedIdParam}/${StickyPostIdParam}`
      .setUrlParams(
        Schema.Struct({
          is_active: Schema.BooleanFromString,
          sticky_type: StickyType,
        })
      )
      .addSuccess(StickyPostSuccess)
  )
  .add(
    HttpApiEndpoint.del(
      "deleteStickyPost"
    )`/app/api/v1/feed-management/sticky-posts/${FeedIdParam}/${StickyPostIdParam}`.addSuccess(
      StickyPostSuccess
    )
  );

class GrazeApiDef extends HttpApi.make("grazeApi")
  .add(GrazeApiGroup)
  .addError(Schema.Unknown) {}

const grazeLive = Effect.gen(function* () {
  const baseUrl = yield* Config.url("GRAZE_API_URL");
  const cookie = yield* Config.redacted("GRAZE_COOKIE");

  const client = yield* HttpApiClient.make(GrazeApiDef, {
    baseUrl: baseUrl.toString(),
    transformClient: (client) =>
      client.pipe(
        HttpClient.filterStatusOk,
        HttpClient.mapRequest(
          HttpClientRequest.setHeaders({
            cookie: Redacted.value(cookie),
          })
        )
      ),
  });

  const updateAlgorithm = (data: Form.FullForm) =>
    Effect.gen(function* () {
      const formData = yield* encodeForm(data);
      return yield* client.updateAlgorithm({ payload: formData });
    });

  const userId = yield* Config.integer("GRAZE_USER_ID");
  const getFeeds = () => client.getFeeds({ payload: { user_id: userId } });

  return {
    ...client,
    updateAlgorithm,
    getFeeds,
  };
});

export class GrazeClient extends Effect.Service<GrazeClient>()("GrazeClient", {
  effect: grazeLive,
  dependencies: [FetchHttpClient.layer],
}) {
  // TODO: test service
}

export class GrazeError extends Data.TaggedError("GrazeError")<{
  message: string;
  status: number;
  statusText: string;
  json: unknown;
}> {}
