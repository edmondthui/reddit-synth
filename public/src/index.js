const keys = require("../../config/keys.js");
const snoowrap = require("snoowrap");
const r = new snoowrap({
  userAgent: keys.userAgent,
  clientId: keys.clientId,
  clientSecret: keys.clientSecret,
  refreshToken: keys.refreshToken,
});

async function fetchComments(response) {
  let content = await r
    .getSubmission(response.id)
    .expandReplies({ limit: 60, depth: 0 });
  // for (let i = 0; i < content.comments.length; i++) {
  //   console.log(content.comments[i].body);
  // }

  clearScreen();
  appendComments(content);
  startReading();
}

function clearScreen() {
  let body = document.getElementsByTagName("BODY")[0];
  while (body.firstChild) {
    body.removeChild(body.lastChild);
  }
}

function appendComments(content) {
  for (let i = 0; i < content.comments.length; i++) {
    let comment = document.createElement("p");
    comment.innerHTML = content.comments[i].body;
    document.body.appendChild(comment);
  }
}

function startReading() {}

document.addEventListener("DOMContentLoaded", () => {
  r.getSubreddit("wallstreetbets")
    .getHot()
    .then((response) => {
      for (let i = 0; i < response.length; i++) {
        let linebreak = document.createElement("br");
        let link = document.createElement("a");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.title = response[i].title;
        document.body.appendChild(link);
        link.addEventListener("click", () => fetchComments(response[i]));
        document.body.appendChild(linebreak);
      }
    });
});
