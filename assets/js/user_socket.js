import { Socket } from "phoenix";
import { promptUsername, setCookie, getCookie } from "./username.js";
import { encryptMessage, decryptMessage } from "./encrypt.js";
import { generateAndAddToMap, getAndConvertPublicKey, sendPublicKey } from "./handshake.js";

(async function () {
    let username = getCookie('username');
    let socket = new Socket("/socket", {
        params: {
            username: username
        }
    });

    socket.connect();

    let channel = socket.channel("room:lobby", {
        username: username
    });

    // Join the channel
    if (username) {
        channel.join()
             .receive("ok",  _ =>  {
                console.log("Joined successfully:  ", username);
             })
             .receive("error", resp  =>  {
                console.log("Unable to join", resp);
             });
    
        exportedPublicKey  = await generateAndAddToMap(username);
        sendPublicKey(exportedPublicKey, username, channel);
    } else {
        promptUsername().then((value)  => {
            username  = value;
            setCookie('username', username);
    
            // Wait for the join and public key sending to complete before proceeding.
            channel.join()
                 .receive("ok",  async _ =>  {
                    console.log("Joined successfully: ", username);
                    exportedPublicKey  = await generateAndAddToMap(username);
                    sendPublicKey(exportedPublicKey, username, channel);
                 })
                 .receive("error", resp  =>  {
                    console.log("Unable to join", resp);
                 });
         });
    }
    
    // Listen for public keys being sent on the channel
    channel.on("publickey", async (payload) => {
        secretKey = await getAndConvertPublicKey(payload.publickey, payload.username);
    });

    channel.on("user_joined", async (payload) => {
        console.log(`User joined: ${payload.username}`)
        sendPublicKey(exportedPublicKey, username, channel);
    });

    let xd = () => Math.floor(Math.random() * 255);
    let rgb_string = `${xd()}, ${xd()}, ${xd()}`;
    let chatInput = document.querySelector("#chat-input");
    let messagesContainer = document.querySelector("#messages");

    // Chat message logic
    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    let { encryptedMessage, iv } = await encryptMessage(secretKey, msg);
                    console.log("SecretKey:", secretKey);
                    console.log("Encrypted message:", encryptedMessage);
                    console.log("IV:", iv);
                    channel.push("new_msg", {
                        username: username,
                        body: encryptedMessage,
                        iv: iv,
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
        if (username) {
            try {
                if (payload.body) {
                    let decryptedMessage = await decryptMessage(secretKey, payload.body, payload.iv);
                    let usernameItem = document.createElement("span");
                    let messageItem = document.createElement("p");

                    usernameItem.className = "username";
                    usernameItem.style.color = `rgb(${payload.color})`;

                    usernameItem.innerText = payload.username;
                    messageItem.innerText = decryptedMessage;

                    let divContainer = document.createElement("div");
                    divContainer.appendChild(usernameItem);
                    divContainer.appendChild(messageItem);

                    if (payload.username === username) {
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
                username = value;
                setCookie('username', username);
            });
        }
    });
})();