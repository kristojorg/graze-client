import { Schema as S } from "effect";
import { Post } from "./Post.js";

export const StoppingCriteria = S.Struct({
  expiration_time: S.Number,
});
export type StoppingCriteria = typeof StoppingCriteria.Type;

export const StickyType = S.Literal("pinned", "rotating");
export type StickyType = typeof StickyType.Type;

const StickyPostBase = S.Struct({
  is_active: S.Boolean,
  stopping_criteria: StoppingCriteria,
  sticky_type: StickyType,
});

export const UpdateStickyPostsBody = S.Struct({
  algo_id: S.Number,
  post_url: S.String,
  ...StickyPostBase.fields,
});
export type UpdateStickyPostsBody = typeof UpdateStickyPostsBody.Type;

export const GetStickyPostsBody = S.Struct({
  sticky_posts: S.Array(
    S.Struct({
      ...StickyPostBase.fields,
      id: S.Number,
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
