import { Schema as S } from "effect";

// ------------------- Primitives ---------------------------------

export const ListUri = S.String;
export type ListUri = typeof ListUri.Type;

export const AttributeName = S.Union(
  S.Literal("text"),
  S.Literal("reply"),
  S.Literal("embed.images[*].alt"),
  S.Literal("embed.alt"),
  S.Literal("embed"),
  S.Literal("embed.external.uri"),
  S.Literal("embed.external.title"),
  S.Literal("embed.external.description")
);
export type AttributeName = typeof AttributeName.Type;
export const AttributeComparison = S.Literal("==", "!=", ">", "<", ">=", "<=");
export type AttributeComparison = typeof AttributeComparison.Type;
export const AttributeValue = S.Null;
export type AttributeValue = typeof AttributeValue.Type;

// ------------------- Filters ------------------------------------

export type Filter =
  | And
  | Or
  | ListMemberFilter
  | AttributeCompare
  | RegexMatches
  | RegexNegationMatches
  | ContentModerationBlock
  | EntityExcludesLabels
  | EmbedType
  | SocialGraph;

export type And = Readonly<{ and: ReadonlyArray<Filter> }>;
export type Or = Readonly<{ or: ReadonlyArray<Filter> }>;
export type ListMemberFilter = Readonly<{
  list_member: readonly [ListUri, "in" | "not_in"];
}>;
export type AttributeCompare = Readonly<{
  attribute_compare: readonly [
    AttributeName,
    AttributeComparison,
    AttributeValue
  ];
}>;
export type RegexMatches = Readonly<{
  regex_matches: readonly [AttributeName, string, boolean];
}>;
export type RegexNegationMatches = Readonly<{
  regex_negation_matches: readonly [AttributeName, string, boolean];
}>;
export type ContentModerationBlock = Readonly<{
  content_moderation: readonly ["OK", ">=", number];
}>;
export type EntityExcludesLabels = Readonly<{
  entity_excludes: readonly ["labels", readonly ["porn", "sexual", "nudity"]];
}>;
export type EmbedType = Readonly<{
  embed_type: readonly [
    "==" | "!=",
    "video" | "image" | "link" | "post" | "gif" | "image_group"
  ];
}>;
export type SocialGraph = Readonly<{
  social_graph: readonly [string, "in" | "not_in", "follows" | "followers"];
}>;

export const Filter = S.Union(
  S.suspend((): S.Schema<And> => And),
  S.suspend((): S.Schema<Or> => Or),
  S.suspend((): S.Schema<ListMemberFilter> => ListMemberFilter),
  S.suspend((): S.Schema<AttributeCompare> => AttributeCompare),
  S.suspend((): S.Schema<RegexMatches> => RegexMatches),
  S.suspend((): S.Schema<RegexNegationMatches> => RegexNegationMatches),
  S.suspend((): S.Schema<ContentModerationBlock> => ContentModerationBlock),
  S.suspend((): S.Schema<EntityExcludesLabels> => EntityExcludesLabels),
  S.suspend((): S.Schema<EmbedType> => EmbedType),
  S.suspend((): S.Schema<SocialGraph> => SocialGraph)
);

export const Or = S.Struct({ or: S.Array(Filter) });
export const And = S.Struct({ and: S.Array(Filter) });
export const ListMemberFilter = S.Struct({
  list_member: S.Tuple(ListUri, S.Literal("in", "not_in")),
});
export const AttributeCompare = S.Struct({
  attribute_compare: S.Tuple(
    AttributeName,
    AttributeComparison,
    AttributeValue
  ),
});
const RegexMatchBase = S.Tuple(
  AttributeName,
  S.String.annotations({
    title: "Regex Pattern",
    description: "The source of the regex pattern to match against.",
  }),
  S.Boolean.annotations({
    title: "Case Insensitive?",
    description: "True if the regex should be case insensitive.",
  })
);
export const RegexMatches = S.Struct({
  regex_matches: RegexMatchBase,
});
export const RegexNegationMatches = S.Struct({
  regex_negation_matches: RegexMatchBase,
});
export const ContentModerationBlock = S.Struct({
  content_moderation: S.Tuple(
    S.Literal("OK"),
    S.Literal(">="),
    S.Number.annotations({
      title: "Threshold",
      description: "The threshold for content moderation.",
    })
  ),
});
export const EntityExcludesLabels = S.Struct({
  entity_excludes: S.Tuple(
    S.Literal("labels"),
    S.Tuple(S.Literal("porn"), S.Literal("sexual"), S.Literal("nudity"))
  ),
});
export const EmbedType = S.Struct({
  embed_type: S.Tuple(
    S.Literal("==", "!="),
    S.Literal("video", "image", "link", "post", "gif", "image_group")
  ),
});
export const SocialGraph = S.Struct({
  social_graph: S.Tuple(
    S.String,
    S.Literal("in", "not_in"),
    S.Literal("follows", "followers")
  ),
});

// ---------------------- Sort Settings -----------------------------

export const SortSettings = S.Struct({
  time_window: S.Number,
  decay_penalty: S.Number,
  like_count_multiplier: S.Number,
  reply_count_multiplier: S.Number,
  repost_count_multiplier: S.Number,
  reader_like_count_multiplier: S.Number,
  reader_reply_count_multiplier: S.Number,
  reader_repost_count_multiplier: S.Number,
});
export type SortSettings = typeof SortSettings.Type;

// ---------------------- Form Data  ---------------------------------

export const DisplayName = S.String.annotations({
  description: "The public name of the feed.",
});
export type DisplayName = typeof DisplayName.Type;

export const RecordName = S.String.annotations({
  description: "The slug of the feed url.",
});
export type RecordName = typeof RecordName.Type;

export const Description = S.String.annotations({
  description: "The description to be shown to users of the feed.",
});
export type Description = typeof Description.Type;

export const Order = S.Union(
  S.Literal("new"),
  S.Literal("trending"),
  S.Literal("blend")
);
export type Order = typeof Order.Type;

export const FeedId = S.NumberFromString;
export type FeedId = typeof FeedId.Type;

export const UserId = S.NumberFromString;
export type UserId = typeof UserId.Type;

export const AlgorithmManifest = S.Struct({
  filter: Filter,
  sort_settings: S.optional(SortSettings),
});
export type AlgorithmManifest = typeof AlgorithmManifest.Type;

export const Metadata = S.Struct({
  document: S.optional(S.Unknown),
  schema: S.optional(
    S.Struct({
      schemaVersion: S.Literal(2),
      sequences: S.Record({ key: S.String, value: S.Number }),
    })
  ),
  session: S.optional(S.Unknown),
});
export type Metadata = typeof Metadata.Type;

export const FullForm = S.Struct({
  id: FeedId,
  user_id: UserId,
  file: S.optional(S.Unknown),
  display_name: DisplayName,
  record_name: RecordName,
  description: S.optional(Description),
  order: Order,
  algorithm_manifest: S.parseJson(AlgorithmManifest),
  metadata: S.optional(S.parseJson(Metadata)),
});
export type FullForm = typeof FullForm.Type;
export type EncodedFullForm = typeof FullForm.Encoded;

/**
 * Actual structure of FormData
 *
 * display_name
 * record_name
 * description
 * order
 * algorithm_manifest
 * metadata
 * id
 * user_id
 * session_cookie
 */
