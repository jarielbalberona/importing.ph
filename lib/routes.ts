import type { UserRole } from "@/db/schema";

export function destinationForRole(role: UserRole) {
  switch (role) {
    case "importer":
      return "/app/requests";
    case "forwarder":
      return "/app/forwarder/requests";
    case "admin":
      return "/admin";
  }
}
