import { Elysia } from "elysia";
import authRoutes from "./src/routes/auth";
import { renderView } from "./src/utils/render";
import { serve } from "bun";
const app = new Elysia();
const messages: { id: string; username: string; message: string }[] = [];
const clients = new Set<WebSocket>();

const server = serve({
port: 3000,
websocket: {
open(ws) {
console.log("✅ Client connected!");
clients.add(ws);
ws.send(JSON.stringify({ action: "load", messages }));
},
message(ws, message) {
console.log("📩 Received:", message);
try {
const data = JSON.parse(message);
if (data.action === "edit") {

const msgIndex = messages.findIndex((msg) => msg.id === data.id && msg.username === data.username);
if (msgIndex !== -1) {
messages[msgIndex].message = data.message;
broadcast({ action: "edit", id: data.id, message: data.message });
}
} else if (data.action === "delete") {

const msgIndex = messages.findIndex((msg) => msg.id === data.id && msg.username === data.username);
if (msgIndex !== -1) {
messages.splice(msgIndex, 1);
broadcast({ action: "delete", id: data.id });
}
} else {
messages.push(data);
broadcast(data);
j}
} catch (error) {
console.error("❌ Error parsing message:", error);
}
},
close(ws) {
console.log("🔌 Client disconnected!");
clients.delete(ws);
},
},
fetch(req, server) {
const url = new URL(req.url);
if (url.pathname === "/ws") {
return server.upgrade(req) ? undefined : new Response("WebSocket Upgrade Failed", { status: 400 });
}
return app.handle(req);
},
});

function broadcast(data: any) {
for (const client of clients) {
if (client.readyState === WebSocket.OPEN) {
client.send(JSON.stringify(data));
}
}
}

app.use(async ({ request, next }) => {
const cookies = request.headers.get("cookie");
const session = cookies?.split("; ").find((c) => c.startsWith("session="));
request.user = session ? session.split("=")[1] : null;
return next();
});

app.get("/", async () => {
    return new Response(await renderView("index"), {
    headers: { "Content-Type": "text/html" },
    });
    });

app.get("/login", async () => {
return new Response(await renderView("login"), {
headers: { "Content-Type": "text/html" },
});
});

app.get("/register", async () => {
return new Response(await renderView("register"), {
headers: { "Content-Type": "text/html" },
});
});

app.get("/home", async ({ request }) => {
if (!request.user) {
return new Response(null, { status: 302, headers: { Location: "/login" } });
}
return new Response(await renderView("home", { username: request.user }), {
headers: { "Content-Type": "text/html" },
});
});

app.get("/logout", async () => {
return new Response(null, {
status: 302,
headers: {
"Set-Cookie": "session=; Path=/; HttpOnly; Max-Age=0",
Location: "/login",
},
});
});

app.use(authRoutes);
console.log("�server sudah berjalan ");



app.get("/*", async ({ request }) => {
  const url = new URL(request.url);
  const filePath = `./src/public${url.pathname}`;
  try {
    const file = Bun.file(filePath);
    if (!(await file.exists())) throw new Error();
    return new Response(file, { headers: { "Content-Type": getContentType(url.pathname) } });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
});

function getContentType(path: string) {
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "text/plain";
}
