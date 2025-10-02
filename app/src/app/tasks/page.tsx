import TasksContent from "../../components/tasks/content";
import { cookies } from "next/headers";
import { getTasksAPI } from "@/api/tasks";

export default async function TasksManagement() {
  const cookieStore = await cookies();
  const initialTasks = await getTasksAPI(undefined, {
    Cookie: await cookieStore.toString(),
  });

  return (
    <>
      <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="container max-w-screen-lg px-4 mx-auto sm:px-6 lg:px-8">
          <TasksContent initialTasks={initialTasks} />
        </div>
      </main>
    </>
  );
}
