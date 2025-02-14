import { Schema as S } from "effect";

export const PartialAlgorithm = S.Struct({
  algorithm_uri: S.String,
  algorithm_manifest_id: S.Union(S.Null, S.Number),
  draft_algorithm_manifest_id: S.Number,
  record_name: S.String,
  display_name: S.String,
  description: S.String,
  feed_did: S.String,
  avatar_url: S.Union(S.String, S.Null),
  cpm_cents: S.Union(S.Number, S.Null),
  deleted: S.Boolean,
  active: S.Boolean,
  public: S.Boolean,
  monetization_available: S.Boolean,
  status: S.Union(S.String, S.Null),
  unique_operator_ids: S.Array(S.Number),
  user_id: S.Number,
  id: S.Number,
  created_at: S.DateFromString,
  updated_at: S.DateFromString,
  deleted_at: S.Union(S.DateFromString, S.Null),
});
export type PartialAlgorithm = typeof PartialAlgorithm.Type;

const Stats = S.Unknown;
const LatestError = S.Unknown;

const FullAlgorithm = S.Struct({
  ...PartialAlgorithm.fields,
  stats: Stats,
  latest_error: LatestError,
  latest_compute_cycle: S.Unknown,
  subscriber_lists: S.Unknown,
});
const FullAlgorithmWithManifest = S.Struct({
  ...FullAlgorithm.fields,
  draft_algorithm_manifest: S.Unknown,
  algorithm_manifest: S.Unknown,
});

export const AlgoUpdateResponse = S.Struct({
  message: S.String,
  algorithm: PartialAlgorithm,
});
export type AlgoUpdateResponse = typeof AlgoUpdateResponse.Type;

export const GetAlgoResponse = S.parseJson(FullAlgorithmWithManifest);
export type GetAlgoResponse = typeof GetAlgoResponse.Type;

export const HidePostBody = S.Struct({
  algo_id: S.Number,
  at_uri: S.String,
});
export type HidePostBody = typeof HidePostBody.Type;

export const UnhidePostBody = S.Struct({
  algo_id: S.Number,
  at_uri: S.String,
});
export type UnhidePostBody = typeof UnhidePostBody.Type;

// ----------------------- Get Algorithms Response -----------------------

export const AlgorithWithStats = S.Struct({
  ...PartialAlgorithm.fields,
  stats: S.Struct({
    page_renders: S.Number,
    unique_users: S.Number,
    post_renders: S.Number,
  }),
});
export type AlgorithmWithStats = typeof AlgorithWithStats.Type;
export const GetAlgorithmsResponse = S.Struct({
  page: S.Number,
  page_size: S.Number,
  total_items: S.Number,
  total_pages: S.Number,
  user_algos: S.Array(AlgorithWithStats),
});
export type GetAlgorithmsResponse = typeof GetAlgorithmsResponse.Type;
