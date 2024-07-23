function showToast(message, type) {
	let toastContainer = document.getElementById("toast-container");
	if (!toastContainer) {
		toastContainer = document.createElement("div");
		toastContainer.id = "toast-container";
		toastContainer.className = "fixed bottom-4 right-4 space-y-2 z-50";
		document.body.appendChild(toastContainer);
	}

	let icon;
	let iconBgClass;
	if (type === "success") {
		icon = `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>`;
		iconBgClass =
			"bg-emerald-100 dark:bg-emerald-800 text-emerald-500 dark:text-emerald-200";
	} else if (type === "danger") {
		icon = `<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg>`;
		iconBgClass =
			"bg-pink-100 dark:bg-pink-800 text-pink-500 dark:text-pink-200";
	}
	const toast = document.createElement("div");
	toast.className =
		"flex items-center w-full max-w-xs p-4 mb-4 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 text-white";
	toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBgClass}">
            ${icon}
            <span class="sr-only">Icon</span>
        </div>
        <div class="ms-3 text-sm font-normal">${message}</div>
        <button type="button" class="bg-white ml-2 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1 hover:bg-gray-100 inline-flex items-center justify-center h-7 w-7 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" aria-label="Close">
            <span class="sr-only">Close</span>
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
        </button>
    `;

	toast.querySelector("button").onclick = () => {
		toast.remove();
	};
	toastContainer.appendChild(toast);
	setTimeout(() => {
		toast.remove();
	}, 2000);
}

export { showToast };
