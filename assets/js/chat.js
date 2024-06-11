async function redirectUserToChat() {
    const uuid = generateChatUuid();
    window.location = `/chat/${uuid}`
}

function connectToChannel(socket, chatUuid, username) {
    let channel = socket.channel(`room:${chatUuid}`, {
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