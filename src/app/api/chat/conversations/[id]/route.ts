import { json } from "@/lib/api/http";
import { deleteConversation, loadDisplayMessages } from "@/server/chat/conversations";
import { authedRoute } from "@/server/route";

type Params = { id: string };

/** GET /api/chat/conversations/{id}: a chat as it was shown. */
export const GET = authedRoute<Params>("GET /api/chat/conversations/[id]", async ({ db, user }, { params }) =>
  json(await loadDisplayMessages(db, user.id, (await params).id)),
);

/** DELETE /api/chat/conversations/{id} */
export const DELETE = authedRoute<Params>("DELETE /api/chat/conversations/[id]", async ({ db, user }, { params }) => {
  await deleteConversation(db, user.id, (await params).id);
  return new Response(null, { status: 204 });
});
