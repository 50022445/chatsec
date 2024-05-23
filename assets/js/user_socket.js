import {
    Socket
} from "phoenix";
import {
    promptUsername,
    setCookie,
    getCookie
} from "./username.js";

(async function () {
    let socket = new Socket("/socket", {
        params: {
            token: window.userToken
        }
    });
    socket.connect();
    let channel = socket.channel("room:lobby", {});
    let chatInput = document.querySelector("#chat-input");
    let messagesContainer = document.querySelector("#messages");

    // Join the channel
    if (username = getCookie('username')) {
        channel.join()
            .receive("ok", _ => {
                console.log("Joined successfully: ", username);
            })
            .receive("error", resp => {
                console.log("Unable to join", resp);
            });
    } else {
        promptUsername().then((value) => {
            let username = value;
            setCookie('username', username);

            channel.join()
                .receive("ok", _ => {
                    console.log("Joined successfully", username);
                })
                .receive("error", resp => {
                    console.log("Unable to join", resp);
                });
        });
    }

    let xd = () => Math.floor(Math.random() * 255);
    let rgb_string = `${xd()}, ${xd()}, ${xd()}`;

    // Chat message logic
    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    channel.push("new_msg", {
                        username: getCookie('username'),
                        body: msg,
                        color: rgb_string
                    });
                    chatInput.value = "";
                    event.preventDefault();
                } catch (error) {
                    console.error("Sending message failed:", error);
                }
            }
        }
    });

    // retrieve the messages
    channel.on("new_msg", async (payload) => {
        if (getCookie('username')) {
            try {
                if (payload.body) {
                    let usernameItem = document.createElement("span");
                    let messageItem = document.createElement("p");

                    usernameItem.className = "username";
                    usernameItem.style.color = `rgb(${payload.color})`;

                    usernameItem.innerText = payload.username;
                    messageItem.innerText = payload.body;

                    let divContainer = document.createElement("div");
                    divContainer.appendChild(usernameItem);
                    divContainer.appendChild(messageItem);

                    if (payload.username === getCookie('username')) {
                        divContainer.className = "flex flex-col items-end gap-1";
                    } else {
                        divContainer.className = "flex flex-col items-start gap-1";
                    }

                    messagesContainer.appendChild(divContainer);
                } else {
                    console.error("Invalid payload:", payload);
                }
            } catch (error) {
                console.error("Something went wrong:", error);
            }
        } else {
            promptUsername().then((value) => {
                let username = value;
                setCookie('username', username);
            });
        }
    });
})();