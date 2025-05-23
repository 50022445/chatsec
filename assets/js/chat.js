import { Socket, Presence } from "phoenix";
import { usernameForm } from "./username";
import { showToast } from "./toast";
import { sanitizeInput } from "./username";

function redirectUserToChat() {
	window.location = "/chat/create";
}

function renderOnlineUsers(presence) {
	const userList = [];
	const svgIcon = `
      <svg class="w-6 h-6 text-emerald-500 inline-block mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
      </svg>
    `;

	presence.list((id, { metas: [first, ...rest] }) => {
		const username = sanitizeInput(id);
		userList.push(username);
	});

	const usernamesDiv = document.getElementById("usernames");
	usernamesDiv.innerHTML = "";
	for (let i = 0; i < userList.length; i++) {
		const username = userList[i];
		const li = document.createElement("li");
		li.classList.add("flex");
		li.classList.add("items-center");
		li.innerHTML = svgIcon;
		li.appendChild(document.createTextNode(username));
		usernamesDiv.appendChild(li);
	}
}

function checkAndConnect(value, callback) {
	const username = value ?? sessionStorage.getItem("username");
	if (!username) {
		usernameForm()
			.then((resolvedUsername) => {
				sessionStorage.setItem("username", resolvedUsername);
				connectToChannel(resolvedUsername, callback);
			})
			.catch(() => {
				showToast("Unable to get username.", "danger");
			});
		return;
	}
	connectToChannel(username, callback);
}

function connectToChannel(username, callback) {
	const socket = new Socket("/socket", {
		params: {
			username: username,
		},
	});
	socket.connect();
	const uuid = window.location.href.split("/").slice(-1)[0];
	const channel = socket.channel(`room:${uuid}`, {
		username: username,
	});
	window.channel = channel;
	const presence = new Presence(channel);
	channel
		.join()
		.receive("ok", () => {
			showToast("Connected to channel.", "success");
			if (callback) {
                presence.onSync(() => renderOnlineUsers(presence, channel));
				callback(channel, username);
			}
		})
		.receive("error", () => {
            window.location.href = "/"
		});

	return { channel, username };
}

function showDeleteChatModal(channel, username) {
	const modalHTML = `
    <div id="deleteChatModal" class="modal fixed inset-0 flex items-center justify-center z-50">
    <div class="p-8 bg-gray-900 rounded-lg max-w-sm w-full">
        <h2 class="text-2xl font-bold text-white mb-4 text-center">Confirm deletion?</h2>
        <div class="flex justify-center mt-4">
            <button id="closeModalButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded mr-2 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 shadow-md">Cancel</button>
            <button id="submitModalButton" class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-md">Delete chat</button>
        </div>
    </div>
</div>
        `;
	const modalContainer = document.createElement("div");
	modalContainer.innerHTML = modalHTML;
	const portal = document.getElementById("portal");
	const root = document.getElementById("root");
	portal.appendChild(modalContainer);
	root.classList.add("blur-2xl");
	document.getElementById("deleteChatModal").style.display = "flex";
	function closeModal() {
		document.getElementById("deleteChatModal").style.display = "none";
		portal.removeChild(modalContainer);
		root.classList.remove("blur-2xl");
	}
	document.getElementById("closeModalButton").addEventListener("click", () => {
		closeModal();
	});
	document.getElementById("submitModalButton").addEventListener("click", () => {
		deleteChat(channel, username);
		closeModal();
	});
}

function deleteChat(channel, username) {
	try {
		channel.push("adios", {
			username: username,
		});
	} catch (e) {
		showToast("Deleting room failed!", "danger");
	}
	sessionStorage.clear();
	window.location = "/";
}

export { redirectUserToChat, showDeleteChatModal, checkAndConnect };
