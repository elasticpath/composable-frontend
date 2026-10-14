export const SESSION_VISITOR_ID_ENV = "VISITOR_SESSION_ID_OPT_IN";

export function isSessionVisitorIdEnabled(): boolean {
  return process.env[SESSION_VISITOR_ID_ENV] === "true";
}
