import loadEnv from "./config/env";
loadEnv();

import http from "http";

const app = require("./app").default;
import { initChatGateway } from "./modules/chat/chat.gateway";

const PORT = process.env.PORT || 5000;

// Create an HTTP server wrapping Express so Socket.io can share it
const httpServer = http.createServer(app);

// Boot the Socket.io chat gateway
initChatGateway(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io chat gateway active`);
});