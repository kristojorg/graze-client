import { Schema, SchemaTransformation } from "effect";
import { FeedIdParam } from "./common.js";
import {
  CreateStickyPostBody,
  GetStickyPostsBody,
  StickyPostIdParam,
  StickyPostSuccess,
  StickyType,
} from "./schema/StickyPosts.js";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

// v4 dropped `Schema.BooleanFromString`; decode the query strings "true"/"false".
const BooleanFromString = Schema.Literals(["true", "false"]).pipe(
  Schema.decodeTo(
    Schema.Boolean,
    SchemaTransformation.transform({
      decode: (s) => s === "true",
      encode: (b) => (b ? "true" : "false"),
    }),
  ),
);

export const StickyPostsApiGroup = HttpApiGroup.make("stickyposts")
  .add(
    HttpApiEndpoint.post("create", "/app/api/v1/feed-management/sticky-posts", {
      payload: CreateStickyPostBody,
      success: StickyPostSuccess,
    }),
  )
  .add(
    HttpApiEndpoint.get(
      "get",
      "/app/api/v1/feed-management/sticky-posts/:feedId",
      {
        params: { feedId: FeedIdParam },
        success: GetStickyPostsBody,
      },
    ),
  )
  .add(
    HttpApiEndpoint.put(
      "update",
      "/app/api/v1/feed-management/sticky-posts/:feedId/:stickyPostId",
      {
        params: { feedId: FeedIdParam, stickyPostId: StickyPostIdParam },
        query: Schema.Struct({
          is_active: BooleanFromString,
          sticky_type: StickyType,
        }),
        success: StickyPostSuccess,
      },
    ),
  )
  .add(
    HttpApiEndpoint.make("DELETE")(
      "delete",
      "/app/api/v1/feed-management/sticky-posts/:feedId/:stickyPostId",
      {
        params: { feedId: FeedIdParam, stickyPostId: StickyPostIdParam },
        success: StickyPostSuccess,
      },
    ),
  );
