import { json } from "@/lib/api/http";
import { listConversations } from "@/server/chat/history";
import { authedRoute } from "@/server/route";

/** GET /api/chat/conversations: the user's 20 most recent chats. */
export const GET = authedRoute("GET /api/chat/conversations", async ({ db, user }) =>
  json({ conversations: await listConversations(db, user.id) }),
);
