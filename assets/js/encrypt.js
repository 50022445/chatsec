import { showToast } from "./toast";

async function generateKeyPair() {
	try {
		const keyPair = await crypto.subtle.generateKey(
			{
				name: "ECDH",
				namedCurve: "P-384",
			},
			true,
			["deriveKey"],
		);
		return keyPair;
	} catch (_) {
		showToast("Generating keys failed!", "danger");
	}
}

async function deriveSecretKey(privateKey, publicKey) {
	try {
		const secretKey = await crypto.subtle.deriveKey(
			{
				name: "ECDH",
				public: publicKey,
			},
			privateKey,
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"],
		);
		return secretKey;
	} catch (e) {
		showToast("Deriving shared secret failed.", "danger");
	}
}

function getMessageEncoding(message) {
	const encoder = new TextEncoder();
	return encoder.encode(message);
}

function encodeBase64(arrayBuffer) {
	let binary = "";
	const bytes = new Uint8Array(arrayBuffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function decodeBase64(base64) {
	const binary = atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

async function encryptMessage(secretKey, message) {
	try {
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const encoded_message = getMessageEncoding(message);
		const encryptedMessage = await crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv: iv,
			},
			secretKey,
			encoded_message,
		);
		return {
			encryptedMessage: encodeBase64(encryptedMessage),
			iv: encodeBase64(iv),
		};
	} catch (e) {
		showToast("Failed to encrypt message!", "danger");
	}
}

async function decryptMessage(secretKey, encryptedMessage, ivBase64) {
	const iv = decodeBase64(ivBase64);
	const decodedMessage = decodeBase64(encryptedMessage);
	try {
		const decrypted = await crypto.subtle.decrypt(
			{
				name: "AES-GCM",
				iv,
			},
			secretKey,
			decodedMessage,
		);
		const decoder = new TextDecoder();
		const decrypted_message = decoder.decode(decrypted);
		return decrypted_message;
	} catch (e) {
		showToast("Failed to decrypt message.", "danger");
	}
}

async function exportPublicKey(key) {
	const exported = await crypto.subtle.exportKey("spki", key);
	const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
	const exportedAsBase64 = btoa(exportedAsString);
	return exportedAsBase64;
}

async function importPublicKey(base64) {
	const binaryDerString = atob(base64);
	const binaryDer = new Uint8Array(
		[...binaryDerString].map((char) => char.charCodeAt(0)),
	);

	const key = await crypto.subtle.importKey(
		"spki",
		binaryDer.buffer,
		{
			name: "ECDH",
			namedCurve: "P-384",
		},
		true,
		[],
	);
	return key;
}

export {
	generateKeyPair,
	deriveSecretKey,
	encryptMessage,
	decryptMessage,
	exportPublicKey,
	importPublicKey,
};
