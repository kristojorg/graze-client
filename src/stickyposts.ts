import { HttpApiGroup, HttpApiEndpoint } from "@effect/platform";
import { Schema } from "effect";
import {
  CreateStickyPostBody,
  GetStickyPostsBody,
  StickyPostIdParam,
  StickyPostSuccess,
  StickyType,
} from "./schema/StickyPosts.js";
import { FeedIdParam } from "./common.js";

export const StickyPostsApiGroup = HttpApiGroup.make("stickyposts")
  .add(
    HttpApiEndpoint.post("create")`/app/api/v1/feed-management/sticky-posts`
      .setPayload(CreateStickyPostBody)
      .addSuccess(StickyPostSuccess)
  )
  .add(
    HttpApiEndpoint.get(
      "get"
    )`/app/api/v1/feed-management/sticky-posts/${FeedIdParam}`.addSuccess(
      GetStickyPostsBody
    )
  )
  .add(
    HttpApiEndpoint.put(
      "update"
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
      "delete"
    )`/app/api/v1/feed-management/sticky-posts/${FeedIdParam}/${StickyPostIdParam}`.addSuccess(
      StickyPostSuccess
    )
  );
