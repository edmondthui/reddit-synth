const keys = require("../../config/keys.js");
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

  clearScreen();
  let comments = document.createElement("div");
  comments.classList.add("comments");
  document.body.appendChild(comments);
  speechSynthesis.addEventListener("voiceschanged", setupVoice);
  appendComments(content);
}

function clearScreen() {
  let body = document.getElementsByTagName("BODY")[0];
  while (body.firstChild) {
    body.removeChild(body.lastChild);
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
  let selectList = document.createElement("select");
  selectList.name = "voices";
  document.body.appendChild(selectList);

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

  speakButton.addEventListener("click", toggle);
  stopButton.addEventListener("click", () => toggle(false));
});
