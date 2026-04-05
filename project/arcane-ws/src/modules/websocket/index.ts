import { Elysia } from "elysia";
import { authCore } from "../../plugin/auth.plugin";

type WSMessage =
  | { type: "join_room"; roomId: string }
  | { type: "leave_room"; roomId: string }
  | { type: "send_message"; roomId: string; content: string };

type Meta = {
  userId: string;
  roomId?: string;
};

// 🧠 In-memory state
const connectionMeta = new Map<any, Meta>();
const rooms = new Map<string, Set<any>>();

export const wsApp = new Elysia().use(authCore).ws("/ws", {
  async beforeHandle({ query: { token }, accessJwt, set, request }) {
    if (!token) {
      set.status = 401;
      console.log("GAGAL TIADA TOKEN");
      return "Unauthorized";
    }

    const payload = accessJwt.verify(token);

    if (!payload) {
      set.status = 401;
      return "Invalid token";
    }
  },

  async open(ws) {
    const url = new URL(ws.data.request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close();
      console.log("GAGAL TIADA TOKEN");
      return;
    }

    const payload = await ws.data.accessJwt.verify(token);

    if (!payload) {
      ws.close();
      return;
    }

    const userId = payload.id;

    connectionMeta.set(ws.id, { userId });

    // console.log("Connected user:", userId);
  },

  message(ws, message: WSMessage) {
    console.log(ws);
    console.log(message);
    const meta = connectionMeta.get(ws.id);

    if (!meta) return;

    switch (message.type) {
      // 👉 JOIN ROOM
      case "join_room": {
        const { roomId } = message;

        const room = rooms.get(roomId);
        if (!room) return;

        // leave room lama
        if (meta.roomId) {
          const oldRoom = rooms.get(meta.roomId);
          oldRoom?.delete(ws);
        }

        // join room baru
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        rooms.get(roomId)!.add(ws);
        meta.roomId = roomId;

        ws.send(
          JSON.stringify({
            type: "joined",
            roomId,
          }),
        );

        break;
      }

      case "leave_room": {
        const { roomId } = message;

        rooms.get(roomId)?.delete(ws);
        meta.roomId = undefined;

        break;
      }

      case "send_message": {
        const { roomId, content } = message;

        const room = rooms.get(roomId);
        if (!room) return;

        const payload = {
          type: "new_message",
          roomId,
          from: meta.userId,
          content,
          createdAt: Date.now(),
        };

        // broadcast ke semua member room
        for (const client of room) {
          client.send(JSON.stringify(payload));
        }

        break;
      }

      default:
        ws.send(JSON.stringify({ error: "Unknown event type" }));
    }
  },

  close(ws) {
    const meta = connectionMeta.get(ws.id);

    if (!meta) return;

    // console.log("Koneksi ditutup:", meta.userId);

    // hapus dari room
    if (meta.roomId) {
      rooms.get(meta.roomId)?.delete(ws);
    }

    // hapus metadata
    connectionMeta.delete(ws);
  },
});
