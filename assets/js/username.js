function promptUsername() {
    return new Promise(resolve => {
        let userName = window.prompt('Enter your username:');

        // Ensure the user entered a valid username
        while (userName === null || userName === '' || userName.length > 10) {
            userName = window.prompt('Invalid username! (Max 10 characters):');
        }

        resolve(userName);
    });
}

function setCookie(name, value) {
    localStorage.setItem(name, value);
}

function getCookie(cookieName) {
    username = localStorage.getItem(cookieName);
    return username;
}

export { promptUsername, setCookie, getCookie };