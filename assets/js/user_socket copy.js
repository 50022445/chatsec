import { Socket } from "phoenix";
import { promptUsername, setCookie, getCookie } from "./username.js";
import { generateKey, encryptMessage, decryptMessage } from "./encrypt.js";

(async function () {
    let socket = new Socket("/socket", { params: { token: window.userToken } });
    socket.connect();

    // Now that you are connected, you can join channels with a topic.
    let channel = socket.channel("room:lobby", {});
    let chatInput = document.querySelector("#chat-input");
    let messagesContainer = document.querySelector("#messages");

    // Generate a new RGB string for every user
    let xd = () => Math.floor(Math.random() * 255);
    let rgb_string = `${xd()}, ${xd()}, ${xd()}`;

    // Generate a key for encryption/decryption (you might want to store this securely)
    let encryptionKey = await generateKey();

    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    // Encrypt the message before sending
                    const { iv, encryptedData } = await encryptMessage(encryptionKey, msg);
                    const ivString = Array.from(iv).map(byte => String.fromCharCode(byte)).join('');
                    const encryptedString = Array.from(new Uint8Array(encryptedData)).map(byte => String.fromCharCode(byte)).join('');

                    channel.push("new_msg", {
                        username: getCookie('username'),
                        body: encryptedString,
                        iv: ivString,
                        color: rgb_string
                    });
                    chatInput.value = "";
                    event.preventDefault();
                } catch (error) {
                    console.error("Encryption failed:", error);
                }
            }
        }
    });

    channel.on("new_msg", async (payload) => {
        if (getCookie('username')) {
            try {
                if (payload.iv && payload.body) {

                    console.log(payload.iv + payload.body)
                    
                    const iv = new Uint8Array(Array.from(payload.iv).map(char => char.charCodeAt(0)));
                    const encryptedData = new Uint8Array(Array.from(payload.body).map(char => char.charCodeAt(0)));

                    console.log(encryptedData)

                    const decryptedMessage = await decryptMessage(encryptionKey, iv, encryptedData);

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
                console.error("Decryption failed:", error);
            }
        } else {
            promptUsername().then((value) => {
                let username = value;
                setCookie('username', username);
            });
        }
    });

    if (getCookie('username')) {
        channel.join()
            .receive("ok", resp => { console.log("Joined successfully", resp); })
            .receive("error", resp => { console.log("Unable to join", resp); });
    } else {
        promptUsername().then((value) => {
            let username = value;
            setCookie('username', username);

            channel.join()
                .receive("ok", resp => { console.log("Joined successfully", resp); })
                .receive("error", resp => { console.log("Unable to join", resp); });
        });
    }
})();
