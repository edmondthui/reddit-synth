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
  let content = await r
    .getSubmission(response.id)
    .expandReplies({ limit: 10, depth: 0 });
  // for (let i = 0; i < content.comments.length; i++) {
  //   console.log(content.comments[i].body);
  // }
  clearThreads();

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

  let speakButton = document.querySelector(".fa-play");
  speakButton.addEventListener("click", () => toggle());
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
  if (speaking) {
    let speakButton = document.querySelector(".fa-stop");
    speakButton.classList.remove("fa-stop");
    speakButton.classList.add("fa-play");
    speechSynthesis.cancel();
    speaking = false;
  } else {
    let speakButton = document.querySelector(".fa-play");
    speakButton.classList.remove("fa-play");
    speakButton.classList.add("fa-stop");
    speaking = true;
    readComments();
  }
}

function readComments() {
  if (speaking) {
    msg.text = commentArray[0];
    speechSynthesis.speak(msg);
    msg.onend = function () {
      let comments = document.querySelector(".comments");
      comments.removeChild(comments.firstChild);
      commentArray = commentArray.slice(1);
      readComments();
    };
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
        let link = document.createElement("p");
        let linkText = document.createTextNode(response[i].title);
        link.appendChild(linkText);
        link.text = response[i].title;
        link.classList.add("thread");
        threads.appendChild(link);
        link.addEventListener("click", () => fetchComments(response[i]));
      }
    });
  e.target[0].value = "";
}

function setOption() {
  if (this.name === "volume") {
    msg.volume = this.value;
  } else {
    msg[this.name] = this.value;
  }
}

const options = document.querySelectorAll('[type="range"], [name="text"]');
let subreddit = document.querySelector(".subreddit");
options.forEach((option) => option.addEventListener("change", setOption));
subreddit.addEventListener("submit", (e) => getSubreddit(e));
