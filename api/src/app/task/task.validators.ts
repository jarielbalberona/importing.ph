import { z } from "zod";
import { validateString } from "@/validators/commonRules";

export const TaskServerSchema = z.object({
  title: validateString("Title"),
  description: validateString("Description"),
});

export type TaskServerSchemaType = z.infer<typeof TaskServerSchema>;
