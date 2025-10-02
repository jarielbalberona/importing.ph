import { z } from "zod";
import { validateString } from "@/validators/commonRules";

export const TaskAssignmentServerSchema = z.object({
  title: validateString("Title"),
  description: validateString("Description"),
});

export type TaskServerSchemaType = z.infer<typeof TaskAssignmentServerSchema>;
