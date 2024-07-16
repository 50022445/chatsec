// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
import { LiveSocket } from "phoenix_live_view";
import topbar from "../vendor/topbar";
import { usernameForm } from "./username.js";
import {
	redirectUserToChat,
	checkAndConnect,
	showDeleteChatModal,
} from "./chat.js";
import { copyChatUrl } from "./link.js";
import { handshake } from "./handshake.js";
import { sendAndReceiveMessages, simulateEnterKeyPress } from "./message.js";
import { donateModal } from "./donate.js";

const csrfToken = document
	.querySelector("meta[name='csrf-token']")
	.getAttribute("content");
const liveSocket = new LiveSocket("/live", Socket, {
	longPollFallbackMs: 2500,
	params: { _csrf_token: csrfToken },
});

// Easter Egg :3
//  console.log('%c" Dont hack me :3 "',
//  'font-weight: bold; font-size: 100px;color: violet; text-align: center; text-shadow: 3px 3px 0 rgb(255,128,197) , \
//    6px 6px 0 rgb(122,251,255) , 9px 9px 0 rgb(145,170,255) , 12px 12px 0 rgb(255,158,158) , 15px 15px 0 rgb(138,255,156) ,\
//    18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)');

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

// connect if there are any LiveViews on the page
liveSocket.connect();

window.simulateEnterKeyPress = simulateEnterKeyPress;
window.donateModal = donateModal;
window.sendAndReceiveMessages = sendAndReceiveMessages;
window.handshake = handshake;
window.copyChatUrl = copyChatUrl;
window.usernameForm = usernameForm;
window.showDeleteChatModal = showDeleteChatModal;
window.redirectUserToChat = redirectUserToChat;
window.checkAndConnect = checkAndConnect;
window.liveSocket = liveSocket;
