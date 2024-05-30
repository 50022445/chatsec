import {
    Socket
} from "phoenix";
import {
    promptUsername,
    setCookie,
    getCookie
} from "./username.js";
import {
    generateKeyPair,
    deriveSecretKey,
    encryptMessage,
    decryptMessage,
    exportPublicKey,
    importPublicKey
} from "./encrypt.js";

(async function () {
    username = getCookie('username')
    let socket = new Socket("/socket", {
        params: {
            username: username
        }
    });

    socket.connect();
    const pubkeyMap = new Map();

    let channel = socket.channel("room:lobby", {
        username: username
    });
    let chatInput = document.querySelector("#chat-input");
    let messagesContainer = document.querySelector("#messages");

    // Join the channel
    if (username) {
        channel.join()
            .receive("ok", _ => {
                console.log("Joined successfully: ", username);
            })
            .receive("error", resp => {
                console.log("Unable to join", resp);
            });
    } else {
        promptUsername().then((value) => {
            let username = value;
            setCookie('username', username);

            channel.join()
                .receive("ok", _ => {
                    console.log("Joined successfully", username);
                })
                .receive("error", resp => {
                    console.log("Unable to join", resp);
                });
        });
    }
    
    let secretKey;
    const keyPair = await generateKeyPair();
    const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
    pubkeyMap.set(exportedPublicKey, username);

    async function getAndConvertPublicKey(publicKey, username) {
        if (pubkeyMap.has(publicKey)) {
            console.log(`Public key already stored from user: ${username}`)
        } else {
            pubkeyMap.set(publicKey, username)
            console.log(`New key inserted from user: ${username}`)
            let convertedPublicKey = await importPublicKey(publicKey)
            return await deriveSecretKey(keyPair.privateKey, convertedPublicKey);
        }
    }

    function sendPublicKey(exportedPublicKey, username) {
        try {
            channel.push("publickey", {
                publickey: exportedPublicKey,
                username: username
            });
        } catch (e) {
            console.log("Something went wrong!:", e);
        }
    }

    // async function getKeyByUsername(username) {
    //     for (const [key, value] of pubkeyMap.entries()) {
    //         if (value == username) {
    //             const importedPublicKey = await importPublicKey(key);
    //         }
    //     }
    //     return null;
    // }

    // Listen for public keys being sent on the channel
    channel.on("publickey", async (payload) => {
        secretKey = await getAndConvertPublicKey(payload.publickey, payload.username);
    });

    channel.on("user_joined", async (payload) => {
        console.log(`User joined: ${payload.username}`)
        sendPublicKey(exportedPublicKey, username);
    });
    // const sleekSecretKey = await deriveSecretKey(sleeksKeyPair.privateKey, hansKeyPair.publicKey);
    // // console.log("Sleeks secret key: ", sleekSecretKey)

    // const hansSecretKey = await deriveSecretKey(hansKeyPair.privateKey, sleeksKeyPair.publicKey)
    // // console.log("Hans secret key: ", hansSecretKey)

    // secretString = "PoC string!"

    // let { encryptedMessage, iv } = await encryptMessage(sleekSecretKey, secretString);
    // console.log("The encrypted message: ", encryptedMessage);

    // let decryptedMessage = await decryptMessage(hansSecretKey, encryptedMessage, iv);
    // console.log("The decrypted message: ", decryptedMessage);

    let xd = () => Math.floor(Math.random() * 255);
    let rgb_string = `${xd()}, ${xd()}, ${xd()}`;

    // Chat message logic
    chatInput.addEventListener("keypress", async (event) => {
        if (!event.shiftKey && event.key === 'Enter') {
            let msg = chatInput.value.trim();
            if (msg.length < 1) {
                return;
            } else {
                try {
                    let { encryptedMessage, iv } = await encryptMessage(secretKey, msg);
                    console.log("SecretKey:", secretKey);
                    console.log("Encrypted message:", encryptedMessage);
                    console.log("IV:", iv);
                    channel.push("new_msg", {
                        username: username,
                        body: encryptedMessage,
                        iv: iv,
                        color: rgb_string
                    });
                    chatInput.value = "";
                    event.preventDefault();
                } catch (error) {
                    console.error("Sending message failed:", error);
                }
            }
        }
    });

    // retrieve the messages
    channel.on("new_msg", async (payload) => {
        if (getCookie('username')) {
            try {
                if (payload.body) {
                    let decryptedMessage = await decryptMessage(secretKey, payload.body, payload.iv);
                    let usernameItem = document.createElement("span");
                    let messageItem = document.createElement("p");

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
        } else {
            promptUsername().then((value) => {
                let username = value;
                setCookie('username', username);
            });
        }
    });
})();