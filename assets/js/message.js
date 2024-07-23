import { handshake } from "./handshake";
import { encryptMessage, decryptMessage } from "./encrypt";
import { showToast } from "./toast";

let secretKey;
let currentChannel;
let currentUsername;
let initialize = false;

async function sendAndReceiveMessages(chatInput, username, channel, messagesContainer) {
    console.log("is the room initialized? ", initialize);
    async function handleKeyPress(event) {
        if (!event.shiftKey && event.key === "Enter") {
            event.preventDefault();
            const msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            }
            try {
                const { encryptedMessage, iv } = await encryptMessage(secretKey, msg);
                channel.push("new_msg", {
                    username: username,
                    body: encryptedMessage,
                    iv: iv,
                });
                chatInput.value = "";
                chatInput.style.height = "40px";
            } catch (error) {
                showToast("Sending message failed!", "danger");
            }
        }
    }

    async function handleNewMsg(payload) {
        try {
            if (payload.body) {
                const usernameItem = document.createElement("span");
                const messageItem = document.createElement("p");
                const decryptedMessage = await decryptMessage(
                    secretKey,
                    payload.body,
                    payload.iv,
                );

                usernameItem.className = "username";
                usernameItem.innerText = payload.username;
                messageItem.innerText = decryptedMessage;
                messageItem.className = "max-w-full break-words";

                const divContainer = document.createElement("div");
                divContainer.className = "flex flex-col gap-1";
                divContainer.appendChild(usernameItem);
                divContainer.appendChild(messageItem);

                if (payload.username === username) {
                    divContainer.classList.add("items-end");
                    usernameItem.style.color = "rgb(138,255,156)";
                } else {
                    divContainer.classList.add("items-start");
                    usernameItem.style.color = "rgb(255, 128, 197)";
                }

                messagesContainer.appendChild(divContainer);
            } else {
                showToast("Invalid payload!", "danger");
            }
        } catch (error) {
            showToast("Something went wrong:", "danger");
        }
    }
    // Check if we need to perform a handshake again
    if (!secretKey || currentChannel !== channel || currentUsername !== username) {
        secretKey = await handshake(null, channel, username);
        currentChannel = channel;
        currentUsername = username;
    }

    if (!initialize) {
        chatInput.addEventListener("keypress", handleKeyPress);
        channel.on("new_msg", handleNewMsg);
        channel.on("room_deleted", handleRoomDeleted);

        initialize = true;
    }

    function handleRoomDeleted() {
        sessionStorage.clear();
        window.location = "/";
    }
}

function simulateEnterKeyPress(element) {
    const enterEvent = new KeyboardEvent("keypress", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
    });
    element.dispatchEvent(enterEvent);
}

export { sendAndReceiveMessages, simulateEnterKeyPress };
