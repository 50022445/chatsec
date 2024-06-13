function promptUsername() {
    return new Promise(resolve => {
        let username = window.prompt('Enter your username:');
        // Ensure the user entered a valid username
        while (username === null || username === '' || username.length > 10) {
            username = window.prompt('Invalid username! (Max 10 characters):');
        }

        resolve(username)
        sessionStorage.setItem('username', username)

    });
}

function setCookie(name, value) {
    sessionStorage.setItem(name, value);
}

function getCookie(cookieName) {
    username = sessionStorage.getItem(cookieName);
    return username;
}

export { promptUsername, setCookie, getCookie };