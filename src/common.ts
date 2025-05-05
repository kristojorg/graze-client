import { HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";

export const UserIdParam = HttpApiSchema.param(
  "userId",
  Schema.NumberFromString
);
export const FeedIdParam = HttpApiSchema.param(
  "feedId",
  Schema.NumberFromString
);
