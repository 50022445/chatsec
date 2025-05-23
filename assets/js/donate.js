import { copyToClipboard } from "./link";

function donateModal() {
	const url =
		"49ibYHn3jesXrgykLqRc1o5vgUC5gizRuRpYvBYy1TKYPjAfPNgHQ91iTafViAFYMbb7AitUcmiiEcRVqywxT1BoBcUtC2C";
	const modalHTML = `
    <div id="copyUrlModal" class="modal fixed inset-0 flex items-center justify-center z-50">
      <div class="p-8 bg-gray-900 rounded-lg max-w-sm w-full">
          <h2 class="text-2xl font-bold text-white mb-4">Donate? &#x1F920;</h2>
          <div class="mb-4">
              <input type="text" id="chatUrl" value="${url}"
                     class="w-full p-2 border focus:outline-none focus:ring-2
                     focus:ring-orange-600 focus:border-transparent bg-gray-800
                     text-white placeholder-gray-500 rounded-md" readonly>
          </div>
          <div class="flex justify-end">
              <button id="closeModalButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded mr-2 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 shadow-md">Close</button>
              <button id="submitModalButton" class="bg-orange-600 hover:bg-orange-800 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 shadow-md">Copy address</button>
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
	document.getElementById("copyUrlModal").style.display = "flex";
	function closeModal() {
		document.getElementById("copyUrlModal").style.display = "none";
		portal.removeChild(modalContainer);
		root.classList.remove("blur-2xl");
	}
	document.getElementById("closeModalButton").addEventListener("click", () => {
		closeModal();
	});
	document.getElementById("submitModalButton").addEventListener("click", () => {
		const address = document.getElementById("chatUrl").value;
		copyToClipboard(address);
		closeModal();
	});
}

export { donateModal };
