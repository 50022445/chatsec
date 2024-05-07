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
    document.cookie = `${name}=${value}`;
}
  
function getCookie(name, cookieName) {
    let cookies = document.cookie;
    let parts = cookies.split("; ");

    for (let i = 0; i < parts.length; i++) {
        let [key, val] = parts[i].split("=");

        if (key === name && key === cookieName) return decodeURIComponent(val);
    }
}

export { promptUsername, setCookie, getCookie };