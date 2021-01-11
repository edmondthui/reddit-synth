const keys = require("../../config/keys");
const snoowrap = require("snoowrap");

const r = new snoowrap({
  userAgent: keys.userAgent,
  clientId: keys.clientId,
  clientSecret: keys.clientSecret,
  refreshToken: keys.refreshToken,
});

document.addEventListener("DOMContentLoaded", () => {
  r.getSubreddit("wallstreetbets")
    .getHot()
    .then((response) => {
      for (let i = 0; i < response.length; i++) {
        let link = document.createElement("a");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.title = response[i].title;
        link.href = response[i].url;
        document.body.appendChild(link);
      }
    });
});
