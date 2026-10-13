import "server-only";

/** The chatbot and recipe generator model. Chosen for strong tool use at half Opus pricing. */
export const CHAT_MODEL = "claude-sonnet-5-5";

/** Messages each user may send per day, to bound API spend. */
export const DAILY_MESSAGE_LIMIT = 30;
