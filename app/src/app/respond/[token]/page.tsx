import { cookies } from "next/headers"
import Review from "@/components/tasks/review"
import { getTaskAssignmentByTokenAPI } from "@/api/tasks"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default async function TaskRespond({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cookieStore = await cookies();

  const respond = await getTaskAssignmentByTokenAPI(token, undefined, {
    Cookie: await cookieStore.toString()
  });

  if (!respond.data) {
    return <Card className="max-w-[600px] mx-auto overflow-hidden shadow-none border-none">
        <CardHeader className="py-5 text-center bg-primary">
          <h1 className="text-2xl font-normal text-primary-foreground">Task Not Found</h1>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <p>Please contact the task creator for a new link if you still need to review this task.</p>
        </CardContent>
      </Card>
  }
  const taskAssignment = respond.data;
  const now = new Date();
  const expiresAt = new Date(taskAssignment.expiresAt);

  if (now > expiresAt) {
    return (
      <Card className="max-w-[600px] mx-auto overflow-hidden shadow-none border-none">
        <CardHeader className="py-5 text-center bg-primary">
          <h1 className="text-2xl font-normal text-primary-foreground">Task Link Expired</h1>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <p className="mb-4">This task approval link has expired.</p>
          <p>Please contact the task creator for a new link if you still need to review this task.</p>
        </CardContent>
      </Card>
    );
  }

  if (taskAssignment.status !== 'pending') {
    return (
      <Card className="max-w-[600px] mx-auto overflow-hidden shadow-none border-none">
        <CardHeader className="py-5 text-center bg-primary">
          <h1 className="text-2xl font-normal text-primary-foreground">Task Already {taskAssignment.status === 'approved' ? 'Approved' : 'Rejected'}</h1>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <p className="mb-4">This task has already been {taskAssignment.status}.</p>
          <p>If you need to make changes, please contact the task creator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Review data={taskAssignment} token={token} />
  );
}
