import { Socket } from "phoenix";
import { promptUsername, setCookie, getCookie } from "./username.js";
import { generateKey, encryptMessage, decryptMessage } from "./encrypt.js";

(async function () {
    let socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();
    let channel = socket.channel("room:lobby", {});
    let chatInput = document.querySelector("#chat-input");
    let messagesContainer = document.querySelector("#messages");

    let { publicKey, privateKey, _ } = await generateKey();
    let encodedPublicKey = btoa(String.fromCharCode(...new Uint8Array(publicKey)));

    console.log(encodedPublicKey)

    if (username = getCookie('username')) {
        channel.join()
            .receive("ok", _ => {
                console.log("Joined successfully: ", username);
                channel.push("new_pub_key", {
                    username: username,
                    publickey: encodedPublicKey
                });
            })
            .receive("error", resp => { console.log("Unable to join", resp); });
    } else {
        promptUsername().then((value) => {
            let username = value;
            setCookie('username', username);

            channel.join()
                .receive("ok", _ => {
                    console.log("Joined successfully", username);
                    channel.push("new_pub_key", {
                        username: username,
                        publickey: encodedPublicKey
                    });
                })
                .receive("error", resp => { console.log("Unable to join", resp); });
        });
    }

    let publicKeys = {};

    channel.on("new_pub_key", (payload) => {
        console.log(payload);
        let binaryString = atob(payload.publickey);
        let byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        publicKeys[payload.username] = byteArray.buffer;
        console.log("Received new public key:", payload);
    });

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
                    let recipientPublicKey = publicKeys[getCookie('username')];
                    if (!recipientPublicKey) {
                        console.error("Public key for the recipient not found.");
                        return;
                    }
                    let encryptedMessage = await encryptMessage(recipientPublicKey, msg);

                    channel.push("new_msg", {
                        username: getCookie('username'),
                        body: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
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

    channel.on("new_msg", async (payload) => {
        if (getCookie('username')) {
            try {
                if (payload.body) {
                    let encryptedBytes = Uint8Array.from(atob(payload.body), c => c.charCodeAt(0));
                    let decryptedMessage = await decryptMessage(privateKey, encryptedBytes);

                    let usernameItem = document.createElement("span");
                    let messageItem = document.createElement("p");

                    usernameItem.className = "username";
                    usernameItem.style.color = `rgb(${payload.color})`;

                    usernameItem.innerText = payload.username;
                    messageItem.innerText = decryptedMessage;

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
