import { io } from "socket.io-client";
import { socket_url } from "../api_url/api_Url";

const socket = io(socket_url, {
  reconnection: true,          // auto-reconnect on drop
  reconnectionAttempts: Infinity, // keep trying
  reconnectionDelay: 1000,     // start at 1 s
  reconnectionDelayMax: 5000,  // cap at 5 s
  transports: ["websocket"],   // skip polling, go straight to WS
});

export default socket;
