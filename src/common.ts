import { Schema } from "effect";

// v4 has no `HttpApiSchema.param`: path params are declared inline in the
// endpoint path (`:feedId`) with a `params: { feedId: FeedIdParam }` schema map.
export const UserIdParam = Schema.NumberFromString;
export const FeedIdParam = Schema.NumberFromString;
