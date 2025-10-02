"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useUpdateTaskAssignmentStatusByToken } from "@/hooks/react-queries/tasks";
import RespondedTaskDialog from "@/components/tasks/dialogs/responded-task";
import LoadingOverlay from "@/components/ui/loading-overlay"
import useCsrf from "@/hooks/use-csrf";

export default function TaskReview({ data, token }: any) {
  useCsrf()
  const [respondData, setRespondData] = useState(null);
  const { mutate, isPending } = useUpdateTaskAssignmentStatusByToken();

  return (
    <>
      <Card className="max-w-[600px] mx-auto overflow-hidden shadow-none border-none">
        {/* Header */}
        <CardHeader className="py-5 text-center bg-primary">
          <h1 className="text-2xl font-normal text-primary-foreground">
            Task Approval Request
          </h1>
        </CardHeader>

        {/* Email Body */}
        <CardContent className="p-5">
          <p className="mb-4">Hello {`${data.assigneeEmail}`},</p>

          <p className="mb-4">
            You have been assigned a new task that requires your approval:
          </p>

          {/* Task Details Box */}
          <div className="p-4 my-4 border border-l-4 rounded border-border border-l-primary bg-muted/30">
            <h2 className="mb-2 text-lg font-normal text-primary">{`${data.task.title}`}</h2>

            <p className="mb-1">
              <span className="font-semibold">Description:</span>
            </p>
            <p className="mb-4">{`${data.task.description}`}</p>

            <p className="mb-1">
              <span className="font-semibold">Invite expiry date: </span>
              {new Date(data.expiresAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </p>
            <p className="mb-0">
              <span className="font-semibold">Assigned By: </span>
              {data.task.creator.name} (Manager)
            </p>
          </div>

          <p className="mb-4">
            Please review the task and respond using the link below:
          </p>

          {/* Review Button */}
          <div className="my-6 space-x-4 text-center">
            <Button
              variant="destructive"
              className="px-5 font-normal"
              onClick={() =>
                mutate(
                  { token, status: "rejected" },
                  {
                    onSuccess: (data) => setRespondData(data),
                  }
                )
              }
            >
              Reject Task
            </Button>
            <Button
              variant="success"
              className="px-5 font-normal"
              onClick={() =>
                mutate({
                  token,
                  status: "approved",
                },
                {
                  onSuccess: (data) => setRespondData(data),
                }
                )
              }
            >
              Approve Task
            </Button>
          </div>

          <p className="mb-4">
            <span className="font-semibold">Note:</span> This link is unique to
            you and will expire after use. Please do not share it with others.
          </p>

          <p className="mb-0">
            If you have any questions about this task, please contact{" "}
            <span className="font-bold">{data.task.creator.name}</span> @{" "}
            <span className="italic text-blue-500">
              {data.task.creator.email}
            </span>{" "}
            directly.
          </p>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex flex-col items-center px-5 py-4 border-t bg-muted/30 text-muted-foreground">
          <p className="mb-1 text-sm">
            © {new Date().getFullYear()} Linky Tasks. All rights reserved.
          </p>
          <p className="mb-0 text-sm">
            This is an automated message, please do not reply to this email.
          </p>
        </CardFooter>
      </Card>
      <RespondedTaskDialog data={respondData} />
      <LoadingOverlay isOpen={isPending} />
    </>
  );
}
