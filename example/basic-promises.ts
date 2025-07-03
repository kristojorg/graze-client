import { GrazeService } from "../src/index";

const graze = new GrazeService({
  apiUrl: "https://api.graze.social",
  cookie: "<change this>",
  userId: 15,
});

const myFeeds = await graze.getFeeds();

// create a sticky post
const stickyPost = await graze.stickyposts.create({
  payload: {
    algo_id: 1,
    post_url:
      "https://bsky.app/profile/kristo.bsky.social/post/3k6222222222222222222222",
    is_active: true,
    sticky_type: "pinned",
  },
  withResponse: true,
});

console.log(myFeeds);
console.log(stickyPost);
