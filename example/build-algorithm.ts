import { GrazeService, F, Algo } from "../src/index";
import { FullForm } from "../src/schema";

const hasNoBadContent = F.and(
  F.isContentOk(0.9),
  F.hasNoNSFWLabels,
  F.isNotListMember("my-blocklist-url")
);

const algo = Algo.filter(
  // the top level filter will combine elements in an "and" block
  hasNoBadContent,
  F.hasVideo,
  F.or(
    F.posterFollows("@samuel.bsky.team"),
    F.isListMember("my-whitelist-url"),
    F.and(
      F.regexMatches("text", "my-keyword-regex"),
      F.regexMatches("embed.alt", "my-keyword-regex"),
      F.regexMatches("embed.external.title", "my-keyword-regex"),
      F.regexMatches("embed.external.description", "my-keyword-regex"),
      F.isPost
    ),
    F.or(
      // nested logic blocks will be automatically flattened, so this will
      // be brought up one level since it is logically equivalent.
      F.regexNegationMatches("text", "my-negative-keyword-regex")
    )
  )
);

const manifest: FullForm = {
  algorithm_manifest: algo,
  id: 12,
  user_id: 1,
  display_name: "My Fancy Feed",
  // file:  add a file blob here to update the image
  description: "This is a fancy feed with lots of logic for fun and profit.",
  order: "new",
  // CAUTION: this will change the feed slug and cause you to lose existing follows.
  // but if you do it, don't worry you can set it back and it will be fixed : ).
  record_name: "my-fancy-feed",
};

const graze = new GrazeService({
  apiUrl: "https://api.graze.social",
  cookie: "<change this>",
  userId: 15,
});

const response = await graze.updateAlgorithm(manifest);
