import { showToast } from "./toast"

async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey({
            name: "ECDH",
            namedCurve: "P-384",
        },
        true,
        ["deriveKey"],
    );

    // console("Keys generated.", "success")
    console.log("keys generated");
    return keyPair;
}

async function deriveSecretKey(privateKey, publicKey) {
    try {
        const secretKey = await crypto.subtle.deriveKey({
                name: "ECDH",
                public: publicKey,
            },
            privateKey, {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"],
        );
        console.log("derive key:", secretKey);
        return secretKey;
    } catch (e) {
        console.log("Something went wrong!", e)
    }
}

function getMessageEncoding(message) {
    let encoder = new TextEncoder()
    return encoder.encode(message)
}

// Encode an array buffer to Base64
function encodeBase64(arrayBuffer) {
    let binary = '';
    let bytes = new Uint8Array(arrayBuffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    console.log("encode Base64:", binary);
    return btoa(binary);
}
  
  // Decode a base64 string back into it's original state
function decodeBase64(base64) {
    let binary = atob(base64);
    let len = binary.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function encryptMessage(secretKey, message) {
    try {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        // console.log("Originele IV:", iv);
        let encoded_message = getMessageEncoding(message);
        let encryptedMessage = await crypto.subtle.encrypt({
                name: "AES-GCM",
                iv: iv,
            },
            secretKey,
            encoded_message
        );
        return {
            encryptedMessage: encodeBase64(encryptedMessage),
            iv: encodeBase64(iv)
        };
    } catch (e) {
        console.log("Something went wrong during the encryption: ", e);
    }
}

async function decryptMessage(secretKey, encryptedMessage, ivBase64) {
    console.log("Received IV:", ivBase64);
    const iv = decodeBase64(ivBase64);
    const decodedMessage = decodeBase64(encryptedMessage)
    console.log("Converted message", decodedMessage);
    try {
        let decrypted = await crypto.subtle.decrypt({
                name: "AES-GCM",
                iv,
            },
            secretKey,
            decodedMessage
        );
        let decoder = new TextDecoder();
        let decrypted_message = decoder.decode(decrypted);
        return decrypted_message;
    } catch (e) {
        console.log("Something went wrong during the decryption: ", e);
    }
}

// Export a key (public or private) to a base64 encoded string
async function exportPublicKey(key) {
    const exported = await crypto.subtle.exportKey("spki", key);
    const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
    const exportedAsBase64 = btoa(exportedAsString);
    return exportedAsBase64;
}

async function importPublicKey(base64) {
    const binaryDerString = atob(base64);
    const binaryDer = new Uint8Array([...binaryDerString].map(char => char.charCodeAt(0)));

    const key = await crypto.subtle.importKey(
        "spki",
        binaryDer.buffer, {
            name: "ECDH",
            namedCurve: "P-384"
        },
        true,
        ["deriveKey"]
    );

    return key;
}


// The key pair can only be used to derive a new secret!
export {
    generateKeyPair,
    deriveSecretKey,
    encryptMessage,
    decryptMessage,
    exportPublicKey,
    importPublicKey
}