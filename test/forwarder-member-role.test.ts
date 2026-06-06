import assert from "node:assert/strict";
import test from "node:test";

import {
  forwarderMemberRoleEnum,
  type ForwarderMemberRole,
} from "@/db/schema";
import { canEditForwarderCompanySettings } from "@/lib/forwarder-company-profile";
import { defaultForwarderMemberRole } from "@/lib/onboarding";

test("forwarder member role enum exposes only allowed values", () => {
  assert.deepEqual(forwarderMemberRoleEnum.enumValues, [
    "owner",
    "admin",
    "member",
  ]);
});

test("onboarding still creates forwarder memberships as owner", () => {
  assert.equal(defaultForwarderMemberRole, "owner");
});

test("owner and admin can edit forwarder company settings", () => {
  const editableRoles: ForwarderMemberRole[] = ["owner", "admin"];

  for (const role of editableRoles) {
    assert.equal(canEditForwarderCompanySettings(role), true);
  }
});

test("member and unknown roles cannot edit forwarder company settings", () => {
  assert.equal(canEditForwarderCompanySettings("member"), false);
  assert.equal(canEditForwarderCompanySettings("unknown"), false);
});
