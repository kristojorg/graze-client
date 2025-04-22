import {
  AttributeComparison,
  AttributeName,
  AttributeValue,
  ContentModerationBlock,
  EmbedType,
  Filter,
  ListMemberFilter,
  PostTypeFilter,
  RegexMatches,
  RegexNegationMatches,
  SocialGraph,
  TextMatchesAny,
  TextMatchesNone,
} from "./schema/index.js";

const and = (...filters: Filter[]) => {
  const flatFilters: Filter[] = [];
  filters.forEach((f) => {
    if ("and" in f) {
      // Automatically flatten nested ands.
      flatFilters.push(...f.and);
    } else {
      flatFilters.push(f);
    }
  });
  return { and: flatFilters };
};
const or = (...filters: Filter[]) => {
  const flatFilters: Filter[] = [];
  filters.forEach((f) => {
    if ("or" in f) {
      flatFilters.push(...f.or);
    } else {
      flatFilters.push(f);
    }
  });
  return { or: flatFilters };
};

const regexMatches = (
  attribute: RegexMatches["regex_matches"][0],
  regex: string
): RegexMatches => ({
  regex_matches: [attribute, regex, true],
});

const regexNegationMatches = (
  attribute: RegexNegationMatches["regex_negation_matches"][0],
  regex: string
): RegexNegationMatches => ({
  regex_negation_matches: [attribute, regex, true],
});

const textMatchesAny = ({
  attribute,
  patterns,
  caseInsensitive = true,
  useRegex = false,
}: {
  attribute: AttributeName;
  patterns: string[];
  caseInsensitive?: boolean;
  useRegex?: boolean;
}): TextMatchesAny => ({
  regex_any: [attribute, patterns, caseInsensitive, useRegex],
});

const textMatchesNone = ({
  attribute,
  patterns,
  caseInsensitive = true,
  useRegex = false,
}: {
  attribute: AttributeName;
  patterns: string[];
  caseInsensitive?: boolean;
  useRegex?: boolean;
}): TextMatchesNone => ({
  regex_none: [attribute, patterns, caseInsensitive, useRegex],
});

const isListMember = (uri: string): ListMemberFilter => ({
  list_member: [uri, "in"],
});
const isNotListMember = (uri: string): ListMemberFilter => ({
  list_member: [uri, "not_in"],
});
const socialGraph = (
  identifier: string,
  op: SocialGraph["social_graph"][1],
  relation: SocialGraph["social_graph"][2]
): SocialGraph => ({
  social_graph: [identifier, op, relation],
});
const posterIsFollowedBy = (identifier: string) =>
  socialGraph(identifier, "in", "followers");
const posterFollows = (identifier: string) =>
  socialGraph(identifier, "in", "follows");
const posterIsNotFollowedBy = (identifier: string) =>
  socialGraph(identifier, "not_in", "followers");
const posterDoesNotFollow = (identifier: string) =>
  socialGraph(identifier, "not_in", "follows");

const embedContains = (type: EmbedType["embed_type"][1]): Filter => ({
  embed_type: ["==", type],
});
const embedDoesNotContain = (type: EmbedType["embed_type"][1]): Filter => ({
  embed_type: ["!=", type],
});

const postTypeIs = (...types: PostTypeFilter["post_type"][1]): Filter => ({
  post_type: ["in", types],
});
const postTypeIsNot = (...types: PostTypeFilter["post_type"][1]): Filter => ({
  post_type: ["not_in", types],
});

const hasVideo: Filter = embedContains("video");

const hasNoNSFWLabels: Filter = {
  entity_excludes: ["labels", ["porn", "sexual", "nudity"]],
};
const attributeCompare = (
  attr: AttributeName,
  op: AttributeComparison,
  value: AttributeValue
): Filter => ({
  attribute_compare: [attr, op, value],
});

const isPost: Filter = postTypeIsNot("reply");
const isReply: Filter = postTypeIs("reply");
const isQuote: Filter = postTypeIs("quote");
const isNotReply: Filter = postTypeIsNot("reply");
const isNotQuote: Filter = postTypeIsNot("quote");

const isContentOk = (threshold: number = 0.9): ContentModerationBlock => ({
  content_moderation: ["OK", ">=", threshold],
});

export const Algo = {
  filter: (...filters: Filter[]): { filter: Filter } => ({
    filter: and(...filters),
  }),
};

export const F = {
  and,
  or,
  regexMatches,
  regexNegationMatches,
  textMatchesAny,
  textMatchesNone,
  attributeCompare,
  isListMember,
  isNotListMember,
  socialGraph,
  posterIsFollowedBy,
  posterFollows,
  posterIsNotFollowedBy,
  posterDoesNotFollow,
  hasVideo,
  hasNoNSFWLabels,
  postTypeIs,
  postTypeIsNot,
  isPost,
  isReply,
  isQuote,
  isNotReply,
  isNotQuote,
  isContentOk,
  embedContains,
  embedDoesNotContain,
};
