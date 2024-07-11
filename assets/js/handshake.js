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
	if (!pubkeyMap.has(publicKey)) {
		pubkeyMap.set(publicKey, username);
		const convertedPublicKey = await importPublicKey(publicKey);
		return await deriveSecretKey(privateKey, convertedPublicKey);
	}
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

async function handshake(channel, username) {
	let secretKey;
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
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
	}

	showToast("Handshake completed!", "success");
	return secretKey;
}

export { handshake };
