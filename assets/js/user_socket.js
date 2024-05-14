import { Socket } from "phoenix"
import { promptUsername, setCookie, getCookie } from "./username.js"

let socket = new Socket("/socket", { params: { token: window.userToken } })
socket.connect()

// Now that you are connected, you can join channels with a topic.
let channel = socket.channel("room:lobby", {})
let chatInput = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")

// Generate a new RGB string for every user
let xd = () => Math.floor(Math.random() * 255);
rgb_string = `${xd()}, ${xd()}, ${xd()}`;

chatInput.addEventListener("keypress", event => {
  if (!event.shiftKey && event.key === 'Enter') {
    let msg = chatInput.value.trim()
    if (msg.length < 1) {
      null;
    } else {
      channel.push("new_msg", { username: getCookie('username'), body: msg, color: rgb_string })
      chatInput.value = "";
      event.preventDefault();
    }
  }
})

channel.on("new_msg", payload => {
  if (getCookie('username')) {
    let usernameItem = document.createElement("span")
    let messageItem = document.createElement("p")

    usernameItem.className = "username"
    usernameItem.style.color = `rgb(${payload.color})`;

    usernameItem.innerText = payload.username;
    messageItem.innerText = payload.body;

    let divContainer = document.createElement("div")
    divContainer.appendChild(usernameItem)
    divContainer.appendChild(messageItem)
    divContainer.className = "column"

    messagesContainer.appendChild(divContainer)
  } else {
    promptUsername().then((value) => {
      username = value;

      setCookie('username', username);
    })
  }
})

if (getCookie('username')) {
  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
} else {
  promptUsername().then((value) => {
    username = value;

    setCookie('username', username);

    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
  });
}

export default socket;
