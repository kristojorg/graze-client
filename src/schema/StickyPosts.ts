import { Schema as S } from "effect";
import { Post } from "./Post.js";
import { HttpApiSchema } from "@effect/platform";

export const StickyPostIdParam = HttpApiSchema.param(
  "stickyPostId",
  S.NumberFromString
);
export type StickyPostIdParam = typeof StickyPostIdParam.Type;

export const StoppingCriteria = S.Struct({
  expiration_time: S.Number.pipe(S.optional),
});
export type StoppingCriteria = typeof StoppingCriteria.Type;

export const StickyType = S.Literal("pinned", "rotating");
export type StickyType = typeof StickyType.Type;

const StickyPostBase = S.Struct({
  is_active: S.Boolean,
  sticky_type: StickyType,
});

export const CreateStickyPostBody = S.Struct({
  algo_id: S.Number,
  post_url: S.String,
  stopping_criteria: StoppingCriteria.pipe(S.optional),
  ...StickyPostBase.fields,
});
export type CreateStickyPostBody = typeof CreateStickyPostBody.Type;

export const GetStickyPostsBody = S.Struct({
  sticky_posts: S.Array(
    S.Struct({
      id: S.Number,
      ...StickyPostBase.fields,
      stopping_criteria: StoppingCriteria.pipe(S.optional),
      hidden: S.Boolean,
      uri: S.String,
      post: Post,
      author: S.String,
      created_at: S.String,
      updated_at: S.String,
    })
  ),
});
export type GetStickyPostsBody = typeof GetStickyPostsBody.Type;

export const StickyPostSuccess = S.Struct({
  message: S.String,
});
export type StickyPostSuccess = typeof StickyPostSuccess.Type;
