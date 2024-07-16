import {
	importPublicKey,
	deriveSecretKey,
	generateKeyPair,
	exportPublicKey,
} from "./encrypt";
import { showToast } from "./toast";

async function generateAndAddToMap(username, pubkeyMap) {
	try {
		keyPair = await generateKeyPair();
		const exportedPublicKey = await exportPublicKey(keyPair.publicKey);
		pubkeyMap.set(exportedPublicKey, username);
		return {
			keyPair,
			exportedPublicKey,
		};
	} catch (e) {
		showToast("Something went wrong! try again later.", "danger");
	}
}

async function getAndConvertPublicKey(
	publicKey,
	username,
	pubkeyMap,
	privateKey,
) {
	pubkeyMap.set(publicKey, username);
	const convertedPublicKey = await importPublicKey(publicKey);
	return await deriveSecretKey(privateKey, convertedPublicKey);
}

function syn(exportedPublicKey, username, channel) {
	try {
		channel.push("publickey", {
			publickey: exportedPublicKey,
			username: username,
		});
	} catch (e) {
		showToast("Something went wrong, try again later.", "danger");
	}
}

async function handshake(value, channel, username) {
	let secretKey = value ?? sessionStorage.getItem("shared");
	if (!secretKey) {
		let acknowledged = false;
		const pubkeyMap = new Map();
		const { keyPair, exportedPublicKey } = await generateAndAddToMap(
			username,
			pubkeyMap,
		);

		channel.on("publickey", async (payload) => {
			const pubkey = payload.publickey;
			const user = payload.username;
			if (user !== username) {
				if (!pubkeyMap.has(pubkey)) {
					secretKey = await getAndConvertPublicKey(
						pubkey,
						user,
						pubkeyMap,
						keyPair.privateKey,
					);
					syn(exportedPublicKey, username, channel);
					acknowledged = true;
				}
			}
		});

		// Initial send of the public key
		syn(exportedPublicKey, username, channel);
		while (!acknowledged) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		showToast("Handshake completed!", "success");

		const secretKeyBase64 = await convertKeyToBase64(secretKey);
		sessionStorage.setItem("shared", secretKeyBase64);
		return secretKey;
	}
	return convertBase64ToKey(secretKey);
}

async function convertKeyToBase64(key) {
	const exportedKey = await crypto.subtle.exportKey("raw", key);
	const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
	return base64Key;
}

async function convertBase64ToKey(base64Key) {
	const binaryString = atob(base64Key);
	const binaryLen = binaryString.length;
	const bytes = new Uint8Array(binaryLen);
	for (let i = 0; i < binaryLen; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	const key = await crypto.subtle.importKey(
		"raw",
		bytes.buffer,
		{
			name: "AES-GCM",
		},
		true,
		["encrypt", "decrypt"],
	);
	return key;
}

export { handshake };
