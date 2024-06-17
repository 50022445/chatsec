import {
    Socket, Presence
} from "phoenix";
import {
    usernameForm
} from "./username";
import {
    showToast
} from "./toast";

async function redirectUserToChat() {
    window.location = '/chat/create'
}

function renderOnlineUsers(presence) {
    let response = "";
    const svgIcon = `
      <svg class="w-6 h-6 text-emerald-700 inline-block mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path fill-rule="evenodd" d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-4Z" clip-rule="evenodd"/>
      </svg>
    `;
  
    presence.list((id, {metas: [first, ...rest]}) => {
      response += `<li class="flex items-center p-2 bg-gray-800 rounded-lg">${svgIcon}${id}</li>`;
    });

    const usernamesDiv = document.getElementById('usernames');
    usernamesDiv.innerHTML = response;
  }

function connectToChannel(username) {
    if (username != null) {
        const socket = new Socket("/socket", {
            params: {
                username: username
            }
        })

        socket.connect()
        const uuid = window.location.href.split("/").slice(-1)[0]
        let channel = socket.channel(`room:${uuid}`, {
            username: username
        })

        let presence = new Presence(channel)
        presence.onSync(() => renderOnlineUsers(presence))

        channel.join()
            .receive("ok", _ => {
                console.log("Joined successfully:  ", username);
            })
            .receive("error", resp => {
                console.log("Unable to join", resp);
            });

        showToast("Connected to channel.", "success")
        return channel
    } else {
        usernameForm().then((username) => {
            connectToChannel(username)
            location.reload();
            showToast("Connected to channel.", "success")
        })
    }
}

function showDeleteChatModal() {
    const modalHTML = `
    <div id="deleteChatModal" class="modal fixed inset-0 flex items-center justify-center z-50">
    <div class="p-8 bg-gray-900 rounded-lg shadow-lg max-w-sm w-full">
      <h2 class="text-2xl font-bold text-white mb-4 text-center">Confirm deletion?</h2>
      <div class="flex justify-center mt-4">
            <button id="closeModalButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded mr-2">Cancel</button>
            <button id="submitModalButton" class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">Delete chat</button>
        </div>
        </div>
    </div>
        `;
    // Create a div element and set its innerHTML to the modal HTML
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;

    const portal = document.getElementById('portal');
    const root = document.getElementById('root');

    portal.appendChild(modalContainer);
    // Add blur class to the body
    root.classList.add('blur-sm')
    // Show the modal
    document.getElementById('deleteChatModal').style.display = 'flex';

    // Function to close the modal and remove it from the DOM
    function closeModal() {
        document.getElementById('deleteChatModal').style.display = 'none';
        portal.removeChild(modalContainer);
        root.classList.remove('blur-sm');
    }

    // Add event listener to close the modal
    document.getElementById('closeModalButton').addEventListener('click', function () {
        closeModal();
    });

    // Add event listener to handle form submission
    document.getElementById('submitModalButton').addEventListener('click', function () {
        closeModal();
        deleteChat();
    });
}

function deleteChat() {
    const uuid = window.location.href.split("/").slice(-1)[0]
    window.location = `/chat/delete/${uuid}`
}

export {
    redirectUserToChat,
    connectToChannel,
    showDeleteChatModal
}