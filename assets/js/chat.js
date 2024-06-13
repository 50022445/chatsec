import {
    Socket
} from "phoenix";
import { promptUsername } from "./username";

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

        return channel
    } else {
        promptUsername().then((username) => {
            connectToChannel(username)
        })
    }
}

function deleteChat() {
    const uuid = window.location.href.split("/").slice(-1)[0]
    window.location = `/chat/delete/${uuid}`
}

export {
    redirectUserToChat,
    connectToChannel,
    deleteChat
}