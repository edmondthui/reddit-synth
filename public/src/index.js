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

async function fetchComments(response) {
  let title = response.title;
  //TODO ADD TITLE TO DOCUMENT
  console.log(response);
  let image;
  if (response.preview) {
    image = response.preview.images[0].source.url;
  }

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

function getSubreddit(e) {
  e.preventDefault();
  removeImage();
  let title = document.querySelector(".title");
  title.innerHTML = "Loading...";
  let threads = document.querySelector(".threads");
  clearThreads();
  clearSubreddits();
  clearComments();
  let search = document.querySelector(".search").children[0];
  r.getSubreddit(search.value)
    .getHot()
    .then((response) => {
      console.log(search.value);
      title.innerHTML = "🔥 Threads";
      for (let i = 0; i < response.length; i++) {
        let link = document.createElement("p");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.text = response[i].title;
        link.classList.add("thread");
        threads.appendChild(link);
        link.addEventListener("click", () => fetchComments(response[i]));
      }
    });
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
