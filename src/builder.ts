import {
  AttributeComparison,
  AttributeName,
  AttributeValue,
  ContentModerationBlock,
  Filter,
  ListMemberFilter,
  RegexMatches,
  RegexNegationMatches,
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

const isListMember = (uri: string): ListMemberFilter => ({
  list_member: [uri, "in"],
});
const isNotListMember = (uri: string): ListMemberFilter => ({
  list_member: [uri, "not_in"],
});
const hasVideo: Filter = {
  embed_type: ["==", "video"],
};
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

const isPost: Filter = attributeCompare("reply", "==", null);
const isReply: Filter = attributeCompare("reply", "!=", null);

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
  attributeCompare,
  isListMember,
  isNotListMember,
  hasVideo,
  hasNoNSFWLabels,
  isPost,
  isReply,
  isContentOk,
};
