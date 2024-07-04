import { showToast } from "./toast";

function usernameForm() {
	return new Promise((resolve, reject) => {
		const modalHTML = `
        <div id="usernameModal" class="modal fixed inset-0 flex items-center justify-center blur-none z-50">
        <div class="p-8 bg-gray-900 rounded-lg max-w-sm w-full blur-none">
            <h2 class="text-2xl font-bold text-white mb-4">Enter Username</h2>
            <input type="text" id="usernameInput" class="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-500 rounded-md mb-4" placeholder="Username">
            <div class="flex justify-end">
                <button id="closeModalButton" class="bg-pink-500 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded mr-2 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-md">Cancel</button>
                <button id="randomModalButton" class="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mr-2 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 shadow-md">Random</button>
                <button id="submitModalButton" class="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 shadow-md">Submit</button>
            </div>
        </div>
    </div>
    
      `;
		const modalContainer = document.createElement("div");
		modalContainer.innerHTML = modalHTML;

		const portal = document.getElementById("portal");
		const root = document.getElementById("root");

		portal.appendChild(modalContainer);
		root.classList.add("blur-2xl");
		document.getElementById("usernameModal").style.display = "flex";

		document
			.getElementById("randomModalButton")
			.addEventListener("click", () => {
				const randomUsername = createRandomUsername();
				document.getElementById("usernameInput").value = randomUsername;
			});

		function closeModal() {
			document.getElementById("usernameModal").style.display = "none";
			portal.removeChild(modalContainer);
			root.classList.remove("blur-2xl");
		}

		document
			.getElementById("closeModalButton")
			.addEventListener("click", () => {
				closeModal();
				reject(new Error("Username not set."));
				showToast("Username not set.", "danger");
			});

		function submitUsername() {
			const username = document.getElementById("usernameInput").value;
			if (username) {
				sessionStorage.setItem("username", username);
				closeModal();
				resolve(username);
				showToast("Username set.", "success");
			} else {
				alert("Please enter a username");
			}
		}

		document
			.getElementById("usernameInput")
			.addEventListener("keypress", (event) => {
				if (event.key === "Enter") {
					submitUsername();
				}
			});

		document
			.getElementById("submitModalButton")
			.addEventListener("click", submitUsername);
	});
}

function createRandomUsername() {
	const adjectives = [
		"agressive",
		"angry",
		"bored",
		"busy",
		"cautious",
		"disturbed",
		"dead",
		"cruel",
		"creepy",
		"elite",
		"fair",
		"envious",
		"good",
		"powerful",
		"rich",
		"strange",
		"sweet",
		"wicked",
		"pleasant",
		"talented",
	];
	const verbs = [
		"aamon",
		"paimon",
		"baal",
		"baphomet",
		"lucifer",
		"mammon",
		"asmodeus",
		"leviathan",
		"beelzebub",
		"azazel",
		"belphegor",
		"legion",
		"oriax",
		"phenex",
		"raum",
		"vapula",
		"sitri",
		"naberus",
		"foraii",
		"gemory",
	];
	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	const firstWord = adjectives[getRandomInt(adjectives.length)];
	const secondWord = verbs[getRandomInt(verbs.length)];
	const randomUsername =
		firstWord.charAt(0).toUpperCase() +
		firstWord.slice(1) +
		secondWord.charAt(0).toUpperCase() +
		secondWord.slice(1);
	return randomUsername;
}

export { usernameForm };
