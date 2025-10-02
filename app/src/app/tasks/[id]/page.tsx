import { getTaskAPI } from "@/api/tasks";
import { cookies } from "next/headers";
import TaskCard from "@/components/tasks/card"

export default async function Task({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const task = await getTaskAPI(id, {
    Cookie: await cookieStore.toString()
  });

  if (!task) {
    return <h1>Task not found</h1>;
  }

  return (
    <>
      <main className="">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            <div className="container max-w-screen-lg px-4 mx-auto sm:px-6 lg:px-8">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <TaskCard task={task} />
                </div>
              </div>
            </div>
          </div>
      </main>
    </>
  );
}
