import { deleteR2Object } from "@/lib/r2-storage";
import { logServerError } from "@/lib/server-log";

export async function persistWithObjectCompensation<T>(
  objectKey: string,
  persist: () => Promise<T>,
  removeObject: (key: string) => Promise<void> = deleteR2Object,
) {
  try {
    return await persist();
  } catch (error) {
    try {
      await removeObject(objectKey);
    } catch (cleanupError) {
      logServerError("storage.upload_compensation_failed", cleanupError);
    }
    throw error;
  }
}
