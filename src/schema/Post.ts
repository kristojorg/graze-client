import { Schema as S } from "effect";

/**
 * Schema for Bluesky objects
 */

export const Author = S.Struct({
  did: S.String,
  $type: S.String,
  avatar: S.String,
  handle: S.String,
  labels: S.Array(S.Any),
  viewer: S.Any,
  createdAt: S.String,
  associated: S.Union(S.Null, S.Any),
  displayName: S.String,
});
export type Author = typeof Author.Type;

export const Record = S.Struct({
  tags: S.Union(S.Null, S.Any),
  text: S.String,
  $type: S.String,
  embed: S.Any,
  langs: S.Array(S.String),
  reply: S.Union(S.Null, S.Any),
  facets: S.Array(S.Any),
  labels: S.Union(S.Null, S.Any),
  entities: S.Union(S.Null, S.Any),
  createdAt: S.String,
});
export type Record = typeof Record.Type;

export const Post = S.Struct({
  cid: S.String,
  uri: S.String,
  $type: S.String,
  embed: S.Any,
  author: Author,
  labels: S.Any,
  record: Record,
  viewer: S.Any,
  indexedAt: S.String,
  likeCount: S.Number,
  quoteCount: S.Number,
  replyCount: S.Number,
  threadgate: S.Union(S.Null, S.Unknown),
  repostCount: S.Number,
});
export type Post = typeof Post.Type;
