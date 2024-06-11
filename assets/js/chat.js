import { Socket } from "phoenix";

async function redirectUserToChat() {
    username = sessionStorage.getItem('username')
     window.socket = new Socket("socket", {
        params: {
            username: username
        }
    })
    console.log(window.socket);
    window.socket.connect()

    const uuid = generateChatUuid();
    window.location = `/chat/${uuid}`
}

function connectToChannel(username) {
    const uuid = window.location.href.split("/").slice(-1)[0]
    let channel = window.socket.channel(`room:${uuid}`, {
        username: username
    })
    channel.join()
        .receive("ok",  _ =>  {
        console.log("Joined successfully:  ", username);
    })
        .receive("error", resp  =>  {
        console.log("Unable to join", resp);
    });

    return channel
}

function generateChatUuid() {
     return crypto.randomUUID();
}

export { redirectUserToChat, connectToChannel }