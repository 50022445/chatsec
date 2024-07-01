import {
    handshake
} from "./handshake";
import { encryptMessage, decryptMessage } from "./encrypt";
import { showToast } from "./toast";

async function sendAndReceiveMessages(chatInput, username, channel, messagesContainer) {
    let secretKey = await handshake(channel, username);
    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    const {
                        encryptedMessage,
                        iv
                    } = await encryptMessage(secretKey, msg);
                    channel.push("new_msg", {
                        username: username,
                        body: encryptedMessage,
                        iv: iv
                    });
                    chatInput.value = "";
                    event.preventDefault();
                } catch (error) {
                    showToast("Sending message failed!", "danger");
                }
            }
        }
    })

    // retrieve the messages
    channel.on("new_msg", async (payload) => {
        try {
            if (payload.body) {
                let usernameItem = document.createElement("span");
                let messageItem = document.createElement("p");
                const decryptedMessage = await decryptMessage(secretKey, payload.body, payload.iv)

                usernameItem.className = "username";
                usernameItem.innerText = payload.username;
                messageItem.innerText = decryptedMessage;

                let divContainer = document.createElement("div");
                divContainer.appendChild(usernameItem);
                divContainer.appendChild(messageItem);

                if (payload.username === username) {
                    divContainer.className = "flex flex-col items-end gap-1";
                    usernameItem.style.color = `rgb(138,255,156)`;
                } else {
                    divContainer.className = "flex flex-col items-start gap-1";
                    usernameItem.style.color = `rgb(255, 128, 197)`;
                }

                messagesContainer.appendChild(divContainer);
            } else {
                showToast("Invalid payload!", "danger");
            }
        } catch (error) {
            showToast("Something went wrong:", "danger");
        }
    });

    channel.on("room_deleted", payload => {
        window.location = "/";
    })
}

export {
    sendAndReceiveMessages
}
