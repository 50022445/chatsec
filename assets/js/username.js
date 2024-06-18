import { showToast } from "./toast";

function usernameForm() {
  return new Promise((resolve, reject) => {
    const modalHTML = `
        <div id="usernameModal" class="modal fixed inset-0 flex items-center justify-center blur-none z-50">
          <div class="p-8 bg-gray-900 rounded-lg shadow-lg max-w-sm w-full blur-none">
            <h2 class="text-2xl font-bold text-white mb-4">Enter Username</h2>
            <input type="text" id="usernameInput" class="w-full p-2 border ocus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-500 rounded-md mb-4" placeholder="Username">
            <div class="flex justify-end">
              <button id="closeModalButton" class="bg-pink-500 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded mr-2">Cancel</button>
              <button id="submitModalButton" class="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </div>
          </div>
        </div>
      `;
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;

    const portal = document.getElementById('portal');
    const root = document.getElementById('root');

    portal.appendChild(modalContainer);
    root.classList.add('blur-2xl')
    document.getElementById('usernameModal').style.display = 'flex';

    function closeModal() {
      document.getElementById('usernameModal').style.display = 'none';
      portal.removeChild(modalContainer);
      root.classList.remove('blur-2xl');
    }

    document.getElementById('closeModalButton').addEventListener('click', function () {
      closeModal();
      showToast('Username not set.', "danger");
    });

    document.getElementById('submitModalButton').addEventListener('click', function () {
      const username = document.getElementById('usernameInput').value;
      if (username) {
        sessionStorage.setItem('username', username);
        closeModal();
        showToast("Username set.", "success")
        resolve(username);
      } else {
        alert('Please enter a username');
      }
    });
  });
}

export {
  usernameForm
};