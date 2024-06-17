import { importPublicKey, deriveSecretKey, generateKeyPair, exportPublicKey } from "./encrypt"
import { showToast } from "./toast";

async function generateAndAddToMap(username, pubkeyMap) {
    try {
        keyPair = await generateKeyPair();
        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
        pubkeyMap.set(exportedPublicKey, username);
        
        return { keyPair, exportedPublicKey }
    } catch (e) {
        console.log("No key pair generated!")
    }
}

async function getAndConvertPublicKey(publicKey, username, pubkeyMap, privateKey, exportedPublicKey, channel) {
    if (pubkeyMap.has(publicKey)) {
        console.log(`Public key already stored from user: ${username}`)
    } else {
        pubkeyMap.set(publicKey, username)
        console.log(`New key inserted from user: ${username}`, publicKey);
        sendPublicKey(exportedPublicKey, username, channel);
        let convertedPublicKey = await importPublicKey(publicKey)
        return await deriveSecretKey(privateKey, convertedPublicKey);
    }
}

function sendPublicKey(exportedPublicKey, username, channel) {
    try {
        channel.push("publickey", {
            publickey: exportedPublicKey,
            username: username
        });
    } catch (e) {
        console.log("Something went wrong!:", e);
    }
}


async function handshake(channel, username) {
    let secretKey;
    const pubkeyMap = new Map;

    const { keyPair, exportedPublicKey } = await generateAndAddToMap(username, pubkeyMap)
    sendPublicKey(exportedPublicKey, username, channel);

    channel.on("publickey", async (payload) => {
        let pubkey = payload.publickey;
        let user = payload.username;
        if (pubkey != exportedPublicKey){
            secretKey = await getAndConvertPublicKey(pubkey, user, pubkeyMap, keyPair.privateKey, exportedPublicKey, channel);
        }
    });
}

export { handshake }