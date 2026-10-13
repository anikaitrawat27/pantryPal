/** Username and password rules, shared by the server's validation and the forms' instant feedback. */
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,24}$/;
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 200;

export type CredentialProblem = "username" | "password" | "same";

export function checkCredentials(username: string, password: string): CredentialProblem[] {
  const problems: CredentialProblem[] = [];
  if (!USERNAME_PATTERN.test(username.trim())) problems.push("username");
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) problems.push("password");
  else if (password.toLowerCase() === username.trim().toLowerCase()) problems.push("same");
  return problems;
}

/** Only same-site paths are allowed as a post-login destination, so links cannot redirect elsewhere. */
export function safeNext(next: string | null | undefined, fallback: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
