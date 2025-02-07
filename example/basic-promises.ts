import { GrazeService } from "../src/index";

const graze = new GrazeService({
  apiUrl: "https://api.graze.social",
  cookie: "<change this>",
  userId: 15,
});

const myFeeds = await graze.getFeeds();

console.log(myFeeds);
