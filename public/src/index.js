require("dotenv").config();
//use the .env file to load the snoowrap stuff instead of requiring keys

const keys = require("../../config/keys");
const snoowrap = require("snoowrap");
const r = new snoowrap({
  userAgent: keys.userAgent,
  clientId: keys.clientId,
  clientSecret: keys.clientSecret,
  refreshToken: keys.refreshToken,
});

const msg = new SpeechSynthesisUtterance();
let voices = [];
let commentArray = [];
let speaking = false;
speechSynthesis.addEventListener("voiceschanged", setupVoice);
let backSearch;
let defaultSubreddits = [
  "wallstreetbets",
  "TIFU",
  "WritingPrompts",
  "AskReddit",
  "LifeProTips",
  "explainlikeimfive",
  "4chan",
  "BlackPeopleTwitter",
  "funny",
  "prequelmemes",
  "Aww",
  "TodayILearned",
  "Facepalm",
  "CrappyDesign",
  "subreddit",
  "WTF",
  "NoContextPics",
  "MildlyInteresting",
  "WholesomeMemes",
];

async function fetchComments(response) {
  let title = response.title;
  let image;
  if (response.preview) {
    image = response.preview.images[0].source.url;
  }

  let back = document.querySelector(".back");
  back.removeEventListener("click", showSubreddits);
  back.addEventListener("click", threadBackClick);

  let content = await r
    .getSubmission(response.id)
    .expandReplies({ limit: 10, depth: 0 });

  clearThreads();

  if (image) {
    let postImage = document.querySelector(".post-image");
    postImage.src = image;
  }
  let threadTitle = document.querySelector(".title");
  threadTitle.innerHTML = title;

  let comments = document.createElement("div");
  comments.classList.add("comments");
  document.body.appendChild(comments);
  appendComments(content);
}

function threadBackClick() {
  let back = document.querySelector(".back");
  let image = document.querySelector(".post-image");
  let title = document.querySelector(".title");
  title.innerHTML = "Loading...";
  if (image) {
    image.src = "";
  }
  showThreads(backSearch);
  back.removeEventListener("click", threadBackClick);
  back.addEventListener("click", showSubreddits);
}

function setVoice() {
  msg.voice = voices.find((voice) => voice.name === this.value);
}

function clearThreads() {
  let threads = document.querySelector(".threads");
  while (threads.firstChild) {
    threads.removeChild(threads.lastChild);
  }
}

function clearComments() {
  commentArray = [];
  let comments = document.querySelectorAll(".comments");
  if (comments) {
    comments.forEach((comment) => comment.parentNode.removeChild(comment));
  }
}

function clearSubreddits() {
  let subreddits = document.querySelector(".subreddits");
  while (subreddits.firstChild) {
    subreddits.removeChild(subreddits.lastChild);
  }
}

function appendComments(content) {
  let comments = document.querySelector(".comments");
  for (let i = 0; i < content.comments.length; i++) {
    let comment = document.createElement("p");
    comment.innerHTML = content.comments[i].body;
    comments.appendChild(comment);
  }
  [...comments.children].forEach((comment) => {
    commentArray.push(comment.innerText);
  });
}

function setupVoice() {
  const voicesDropdown = document.querySelector('[name="voice"]');
  voices = this.getVoices();
  voicesDropdown.innerHTML = voices
    .map(
      (voice) =>
        `<option value='${voice.name}'>${voice.name} (${voice.lang})</option>`
    )
    .join("");
  voicesDropdown.addEventListener("change", setVoice);
}

function toggle() {
  if (commentArray.length > 0) {
    let speakButton = document.querySelector(".fa");
    if (speaking) {
      speakButton.classList.remove("fa-stop");
      speakButton.classList.add("fa-play");
      speechSynthesis.cancel();
      speaking = false;
    } else {
      speakButton.classList.remove("fa-play");
      speakButton.classList.add("fa-stop");
      speaking = true;
      readComments();
    }
  }
}

function removeImage() {
  document.querySelector(".post-image").src = "";
}

function readComments() {
  if (speaking) {
    msg.text = commentArray[0];
    speechSynthesis.speak(msg);
    msg.onend = function () {
      let comments = document.querySelector(".comments");
      if (comments) {
        comments.removeChild(comments.firstChild);
        commentArray = commentArray.slice(1);
        readComments();
      } else {
        let speakButton = document.querySelector(".fa");
        speakButton.classList.remove("fa-stop");
        speakButton.classList.add("fa-play");
        speaking = false;
      }
    };
  }
}

function createDefaultSubreddits() {
  let subreddits = document.querySelector(".subreddits");
  let title = document.querySelector(".title");
  title.innerHTML = "Subreddits";
  let back = document.querySelector(".back");
  back.parentNode.removeChild(back);
  for (let i = 0; i < defaultSubreddits.length; i++) {
    let subreddit = document.createElement("p");
    let subredditText = document.createTextNode(defaultSubreddits[i]);
    subreddit.appendChild(subredditText);
    subreddit.classList.add("subreddit");
    subreddits.appendChild(subreddit);
    subreddit.addEventListener("click", (e) => {
      let search = document.querySelector(".search");
      search.children[0].value = e.target.innerHTML;
      getSubreddit(e);
    });
  }
}

function showSubreddits() {
  clearThreads();
  createDefaultSubreddits();
}

function showThreads(subreddit) {
  console.log(subreddit);
  clearComments();
  clearThreads();
  let title = document.querySelector(".title");
  let threads = document.querySelector(".threads");
  r.getSubreddit(subreddit)
    .getHot()
    .then((response) => {
      title.innerHTML = "🔥 Threads";
      let postContent = document.querySelector(".post-content");
      if (!document.querySelector(".back")) {
        let backLink = document.createElement("p");
        backLink.classList.add("back");
        backLink.innerHTML = "⬅️ Back";
        postContent.prepend(backLink);
        backLink.addEventListener("click", showSubreddits);
      }

      for (let i = 0; i < response.length; i++) {
        let link = document.createElement("p");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.classList.add("thread");
        threads.appendChild(link);
        link.addEventListener("click", () => fetchComments(response[i]));
      }
    });
}

function getSubreddit(e) {
  e.preventDefault();
  removeImage();
  let title = document.querySelector(".title");
  title.innerHTML = "Loading...";

  clearThreads();
  clearSubreddits();
  clearComments();
  let search = document.querySelector(".search").children[0];
  backSearch = search.value;
  showThreads(search.value);
  // r.getSubreddit(search.value)
  //   .getHot()
  //   .then((response) => {
  //     title.innerHTML = "🔥 Threads";
  //     let postContent = document.querySelector(".post-content");
  //     if (!document.querySelector(".back")) {
  //       let backLink = document.createElement("p");
  //       backLink.classList.add("back");
  //       backLink.innerHTML = "⬅️ Back";
  //       postContent.prepend(backLink);
  //       backLink.addEventListener("click", showSubreddits);
  //     }

  //     for (let i = 0; i < response.length; i++) {
  //       let link = document.createElement("p");
  //       let linkText = document.createTextNode(response[i].title);
  //       link.appendChild(linkText);
  //       link.classList.add("thread");
  //       threads.appendChild(link);
  //       link.addEventListener("click", () => fetchComments(response[i]));
  //     }
  //   });
  search.value = "";
}

function setOption() {
  if (this.name === "volume") {
    msg.volume = this.value;
  } else {
    msg[this.name] = this.value;
  }
}

const options = document.querySelectorAll('[type="range"], [name="text"]');
let search = document.querySelector(".search");
options.forEach((option) => option.addEventListener("change", setOption));
search.addEventListener("submit", (e) => getSubreddit(e));

document.querySelectorAll(".subreddit").forEach((subreddit) =>
  subreddit.addEventListener("click", (e) => {
    let search = document.querySelector(".search");
    search.children[0].value = e.target.innerHTML;
    getSubreddit(e);
  })
);

document.addEventListener("DOMContentLoaded", () => {
  let speakButton = document.querySelector(".fa");
  speakButton.addEventListener("click", () => toggle());
  let title = document.querySelector(".title");
  title.innerHTML = "Subreddits";
});
