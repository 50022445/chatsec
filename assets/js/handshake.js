import { importPublicKey, deriveSecretKey, generateKeyPair, exportPublicKey } from "./encrypt"

let keyPair;
const pubkeyMap = new Map;

async function generateAndAddToMap(username) {
    try {
        keyPair = await generateKeyPair();
        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
        pubkeyMap.set(exportedPublicKey, username);

        return exportedPublicKey
    } catch (e) {
        console.log("No keypair generated!")
    }
}

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

export { generateAndAddToMap, getAndConvertPublicKey, sendPublicKey }