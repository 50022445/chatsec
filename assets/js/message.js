import { handshake } from "./handshake";
import { encryptMessage, decryptMessage } from "./encrypt";
let xd = () => Math.floor(Math.random() * 255);

async function sendAndReceiveMessages(chatInput, username, channel, messagesContainer) {
    let secretKey = await handshake(channel, username);
    console.log(secretKey);
    let rgb_string = `${xd()}, ${xd()}, ${xd()}`;
    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    const { encryptedMessage, iv } = await encryptMessage(secretKey, msg);
                    console.log(encryptedMessage, iv);
                    channel.push("new_msg", {
                        username: username,
                        body: encryptedMessage,
                        color: rgb_string,
                        iv: iv
                    });
                    chatInput.value = "";
                    event.preventDefault();
                } catch (error) {
                    console.error("Sending message failed:", error);
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
    });
}

export {
    sendAndReceiveMessages
}