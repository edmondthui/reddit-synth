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

async function fetchComments(response) {
  let content = await r
    .getSubmission(response.id)
    .expandReplies({ limit: 60, depth: 0 });
  // for (let i = 0; i < content.comments.length; i++) {
  //   console.log(content.comments[i].body);
  // }
  clearThreads();

  let comments = document.createElement("div");
  comments.classList.add("comments");
  document.body.appendChild(comments);
  speechSynthesis.addEventListener("voiceschanged", setupVoice);
  appendComments(content);
}

function clearThreads() {
  let threads = document.querySelector(".threads");
  while (threads.firstChild) {
    threads.removeChild(threads.lastChild);
  }
}

function appendComments(content) {
  let comments = document.querySelector(".comments");
  for (let i = 0; i < content.comments.length; i++) {
    let comment = document.createElement("p");
    comment.innerHTML = content.comments[i].body;
    comments.appendChild(comment);
  }
}

function setupVoice() {
  let nav = document.querySelector(".nav");
  let selectList = document.createElement("select");
  selectList.name = "voices";
  nav.appendChild(selectList);

  const voicesDropdown = document.querySelector('[name="voices"]');
  voices = this.getVoices();
  voicesDropdown.innerHTML = voices
    .map(
      (voice) =>
        `<option value='${voice.name}'>${voice.name} (${voice.lang})</option>`
    )
    .join("");

  voicesDropdown.addEventListener("change", setVoice);
}

function setVoice() {
  msg.voice = voices.find((voice) => voice.name === this.value);
  toggle();
}

function toggle(startOver = true) {
  speechSynthesis.cancel();
  if (startOver) {
    speechSynthesis.speak(msg);
  }
}

function getSubreddit(e) {
  e.preventDefault();
  let threads = document.querySelector(".threads");
  while (threads.firstChild) {
    threads.removeChild(threads.lastChild);
  }
  r.getSubreddit(e.target[0].value)
    .getHot()
    .then((response) => {
      for (let i = 0; i < response.length; i++) {
        let linebreak = document.createElement("br");
        let link = document.createElement("a");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.title = response[i].title;
        threads.appendChild(link);
        link.addEventListener("click", () => fetchComments(response[i]));
        threads.appendChild(linebreak);
      }
    })
    .catch((error) => {
      console.log(error);
    });
  e.target[0].value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  let subreddit = document.querySelector(".subreddit");
  subreddit.addEventListener("submit", (e) => getSubreddit(e));
  speakButton.addEventListener("click", toggle);
  stopButton.addEventListener("click", () => toggle(false));
});
