import { json } from "@/lib/api/http";
import { authedRoute } from "@/server/route";
import { getUserData } from "@/server/user-data";

/** GET /api/me/data: everything the user has saved. */
export const GET = authedRoute("GET /api/me/data", async ({ db, user }) => json(await getUserData(db, user.id)));
