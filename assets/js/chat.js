import {
    Socket
} from "phoenix";

async function redirectUserToChat() {
    const uuid = generateChatUuid();
    window.location = `/chat/${uuid}`
}

function connectToChannel(username) {
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

    return channel
}

function generateChatUuid() {
    return crypto.randomUUID();
}

export {
    redirectUserToChat,
    connectToChannel
}