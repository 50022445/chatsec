import { handshake } from "./handshake";
import { encryptMessage, decryptMessage } from "./encrypt";
import { showToast } from "./toast";

async function sendAndReceiveMessages(
	chatInput,
	username,
	channel,
	messagesContainer,
) {
	const secretKey = await handshake(channel, username);
	chatInput.addEventListener("keypress", async (event) => {
		if (!event.shiftKey && event.key === "Enter") {
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
				event.preventDefault();
			} catch (error) {
				showToast("Sending message failed!", "danger");
			}
		}
	});

	// retrieve the messages
	channel.on("new_msg", async (payload) => {
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
				// Use Tailwind CSS classes to control width and word break
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
	});

	channel.on("room_deleted", (payload) => {
		window.location = "/";
	});
}

function simulateEnterKeyPress(element) {
	// Create a new 'Enter' key event
	const enterEvent = new KeyboardEvent("keypress", {
		key: "Enter",
		code: "Enter",
		keyCode: 13,
		which: 13,
		bubbles: true,
		cancelable: true,
	});

	// Dispatch the event on the element
	element.dispatchEvent(enterEvent);
}

export { sendAndReceiveMessages, simulateEnterKeyPress };
