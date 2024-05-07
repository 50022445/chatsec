// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// Bring in Phoenix channels client library:
import { Socket } from "phoenix"
import { promptUsername, setCookie, getCookie } from "./username.js"

// And connect to the path in "lib/chatsec_web/endpoint.ex". We pass the
// token for authentication. Read below how it should be used.
let socket = new Socket("/socket", { params: { token: window.userToken } })

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/chatsec_web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/chatsec_web/templates/layout/app.html.heex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/chatsec_web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1_209_600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, connect to the socket:
socket.connect()

// Now that you are connected, you can join channels with a topic.
let channel = socket.channel("room:lobby", {})
let chatInput = document.querySelector("#chat-input")
let messagesContainer = document.querySelector("#messages")

// Listen for the 'shift + enter' combo
chatInput.addEventListener("keypress", event => {
  if (event.shiftKey && event.key === 'Enter') {
    let msg = chatInput.value.trim()
    if (msg.length < 1) {
      null;
    } else {
      channel.push("new_msg", { body: msg })
    }
  }
})

channel.on("new_msg", payload => {
  if (getCookie('username', 'username')) {
    let username = getCookie('username', 'username');
    let messageItem = document.createElement("p")
    messageItem.innerText = `${username}: ${payload.body}`
    messagesContainer.appendChild(messageItem)

    // Clear the textarea
    chatInput.value = ""
  } else {
    promptUsername().then((value) => {
      username = value;

      setCookie('username', username);
    })
  }
})

if (getCookie('username', 'username')) {
  channel.join()
    .receive("ok", resp => { console.log("Joined successfully", resp) })
    .receive("error", resp => { console.log("Unable to join", resp) })
} else {
  promptUsername().then((value) => {
    username = value;

    setCookie('username', username);

    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
  });
}

export default socket;
