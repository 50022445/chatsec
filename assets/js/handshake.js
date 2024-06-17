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

async function getAndConvertPublicKey(exportedPublicKey, username, pubkeyMap, privateKey) {
    if (pubkeyMap.has(exportedPublicKey)) {
        console.log(`Public key already stored from user: ${username}`)
    } else {
        pubkeyMap.set(exportedPublicKey, username)
        console.log(`New key inserted from user: ${username}`, exportPublicKey)
        let convertedPublicKey = await importPublicKey(exportedPublicKey)
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

async function handshake(username, channel) {
    try {
        const pubkeyMap = new Map();
        const { keyPair, exportedPublicKey } = await generateAndAddToMap(username, pubkeyMap);
        const secretkey = await getAndConvertPublicKey(exportPublicKey, username, pubkeyMap, keyPair.privateKey);
        sendPublicKey(exportedPublicKey, username, channel);
        showToast("Public keys exchanged!", "success");
        return secretkey;

    } catch (e) {
        showToast(e, "danger");
        console.log(e);
    }
}

export { handshake }