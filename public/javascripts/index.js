import "./index.css";
const snoowrap = require("snoowrap");
const redditInfo = require("../../config/keys");
const r = new snoowrap({
  userAgent: redditInfo.userAgent,
  clientId: redditInfo.clientId,
  clientSecret: redditInfo.clientSecret,
  refreshToken: redditInfo.refreshToken,
});

document.addEventListener("DOMContentLoaded", () => {
  let posts = r
    .getSubreddit("wallstreetbets")
    .getHot()
    .then((response) => {
      debugger;
      for (let i = 0; i < response.length; i++) {
        let link = document.createElement("a");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.title = response[i].title;
        link.href = response[i].url;
        document.body.appendChild(link);
      }
    });

  // for (let post in posts) {
  //   debugger;
  //   let link = document.createElement("a");
  //   let linkText = document.createTextNode(post.title);
  //   link.appendChild(linkText);
  //   link.title(post.title);
  //   link.href(post.url);
  //   document.body.appendChild(link);
});
