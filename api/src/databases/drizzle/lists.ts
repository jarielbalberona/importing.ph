export const ROLE_LIST = {
  IMPORTER: "importer",
  FORWARDER: "forwarder",
  enumValues: [
    "importer",
    "forwarder"
	]
} as const;

export const TOKEN_LIST = {
	PASSWORD_RESET: "PASSWORD_RESET",
	EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
	LOGIN_OTP: "LOGIN_OTP",
	enumValues: ["PASSWORD_RESET", "EMAIL_VERIFICATION", "LOGIN_OTP"]
} as const;
