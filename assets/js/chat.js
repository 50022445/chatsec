import {
    Socket
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