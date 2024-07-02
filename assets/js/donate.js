import { copyToClipboard } from "./link";

function donateModal() {
    const url = "CRYPTO_ADDRESS_HERE"
    const modalHTML = `
    <div id="copyUrlModal" class="modal fixed inset-0 flex items-center justify-center z-50">
      <div class="p-8 bg-gray-900 rounded-lg shadow-lg max-w-sm w-full">
          <h2 class="text-2xl font-bold text-white mb-4">Donate?</h2>
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
    // Create a div element and set its innerHTML to the modal HTML
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
  
    const portal = document.getElementById('portal');
    const root = document.getElementById('root');
  
    portal.appendChild(modalContainer);
    // Add blur class to the body
    root.classList.add('blur-2xl')
    // Show the modal
    document.getElementById('copyUrlModal').style.display = 'flex';
  
    // Function to close the modal and remove it from the DOM
    function closeModal() {
      document.getElementById('copyUrlModal').style.display = 'none';
      portal.removeChild(modalContainer);
      root.classList.remove('blur-2xl');
    }
  
    // Add event listener to close the modal
    document.getElementById('closeModalButton').addEventListener('click', function () {
      closeModal();
    });
  
    // Add event listener to handle form submission
    document.getElementById('submitModalButton').addEventListener('click', function () {
      const address = document.getElementById('chatUrl').value;
      copyToClipboard(address)
      closeModal();
    });
  }

export { 
    donateModal
}