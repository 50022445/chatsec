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

async function getAndConvertPublicKey(publicKey, username, pubkeyMap, privateKey) {
    if (pubkeyMap.has(publicKey)) {
        console.log(`Public key already stored from user: ${username}`)
    } else {
        pubkeyMap.set(publicKey, username)
        console.log(`New key inserted from user: ${username}`, publicKey);
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
        console.log("Something went wrong!:", e);
    }
}

function synAck(exportedPublicKey, username, channel) {
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
    let acknowledged = false; // Flag to indicate acknowledgment
    const pubkeyMap = new Map();
    let secretKey;

    // Generate key pair and export public key
    const { keyPair, exportedPublicKey } = await generateAndAddToMap(username, pubkeyMap);
    
    // Event listener for incoming public keys
    channel.on("publickey", async (payload) => {
        let pubkey = payload.publickey;
        let user = payload.username;
        if (user !== username) {
            console.log("Received public key from:", user);
            if (!pubkeyMap.has(pubkey)) {
                // Convert and store the received public key
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

    // Wait for acknowledgment
    while (!acknowledged) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
    }

    console.log("Acknowledgment received. Handshake complete.");
    return secretKey;
}

export { handshake };