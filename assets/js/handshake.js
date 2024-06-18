import {
    importPublicKey,
    deriveSecretKey,
    generateKeyPair,
    exportPublicKey
} from "./encrypt"
import {
    showToast
} from "./toast";

async function generateAndAddToMap(username, pubkeyMap) {
    try {
        keyPair = await generateKeyPair();
        const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
        pubkeyMap.set(exportedPublicKey, username);
        return {
            keyPair,
            exportedPublicKey
        }
    } catch (e) {
        showToast("Something went wrong! try again later.", "danger");
    }
}

async function getAndConvertPublicKey(publicKey, username, pubkeyMap, privateKey) {
    if (!pubkeyMap.has(publicKey)) {
        pubkeyMap.set(publicKey, username)
        let convertedPublicKey = await importPublicKey(publicKey)
        return await deriveSecretKey(privateKey, convertedPublicKey);
    }
}

function syn(exportedPublicKey, username, channel) {
    try {
        channel.push("publickey", {
            publickey: exportedPublicKey,
            username: username
        });
    } catch (e) {
        showToast("Something went wrong, try again later.", "danger");
    }
}

async function handshake(channel, username) {
    let acknowledged = false; // Flag to indicate acknowledgment
    const pubkeyMap = new Map();
    let secretKey;
    const {
        keyPair,
        exportedPublicKey
    } = await generateAndAddToMap(username, pubkeyMap);

    channel.on("publickey", async (payload) => {
        let pubkey = payload.publickey;
        let user = payload.username;
        if (user !== username) {
            if (!pubkeyMap.has(pubkey)) {
                secretKey = await getAndConvertPublicKey(pubkey, user, pubkeyMap, keyPair.privateKey);
                // Send your public key back to the other user
                syn(exportedPublicKey, username, channel);
                // Set the acknowledgment flag
                acknowledged = true;
            }
        }
    });

    // Initial send of the public key
    syn(exportedPublicKey, username, channel);
    while (!acknowledged) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
    }

    showToast("Handshake completed!", "success");
    return secretKey;
}

export {
    handshake
};