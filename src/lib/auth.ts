export const AUTH_COOKIE_NAME = "kb_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function verifyPassword(input: string): boolean {
  const sitePassword = process.env.SITE_PASSWORD;
  if (!sitePassword) return false;
  return input === sitePassword;
}
