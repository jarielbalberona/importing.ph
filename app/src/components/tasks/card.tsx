"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ConfirmDeleteTaskDialog from "@/components/tasks/dialogs/confirm-delete-task";
import {
  useCreateTaskAssignment,
  useDeleteTask,
} from "@/hooks/react-queries/tasks";
import CreateEditTaskDialog from "./dialogs/create-edit-task";
import { toast } from "sonner";
import { useTask } from "@/hooks/react-queries/tasks"
import { useParams } from "next/navigation";
import { appQueryClient } from "@/providers/react-query";
import { useRouter } from "next/navigation";

const TaskCard = ({ task: initialTask }: any) => {
  const { id } = useParams()
  const router = useRouter();
  const createTaskAssignmentMutation = useCreateTaskAssignment();
  const useDeleteTaskMutation = useDeleteTask();
  const {data: task} = useTask(initialTask.id, initialTask);

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [email, setEmail] = useState("");

  const onSendTaskToEmail = (email: string) => {
    createTaskAssignmentMutation.mutate(
      {
        taskId: task.id,
        assigneeEmail: email,
      },
      {
        onSuccess: () => {
          toast.success("Task assigned successfully")
          appQueryClient.invalidateQueries({ queryKey: ["task", task.id] });
        }
      }
    );
  };

  const onDeleteTask = () => {
    useDeleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted successfully")
        if (id) {
          router.push("/tasks")
        }
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2 max-w-[300px] min-h-[2.5rem] text-lg">
            {task.title}
          </CardTitle>
          <Badge
            variant={
              !task.assigned
                ? "outline"
                : task.assignment?.status === "approved"
                ? "success"
                : task.assignment?.status === "rejected"
                ? "destructive"
                : "default"
            }
          >
            {!task.assigned ? "unassigned" : task.assignment?.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 max-w-[300px] min-h-[2.5rem]">
          {task.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {task?.assignment?.id ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={task.assignment.avatar || "/placeholder.svg"}
                    alt={task.assignment.assigneeEmail}
                  />
                  <AvatarFallback>
                    {task.assignment.assigneeEmail.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.assignment.assigneeEmail}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Due: {new Date(task.assignment.expiresAt).toLocaleDateString()}
            </div>
          </>
        ) : (
          <div className="grid gap-2">
            <div>
              <label
                htmlFor="query"
                className="block font-medium text-gray-900 text-sm/6"
              >
                Assign task to email:
              </label>
              <div className="flex mt-2">
                <div className="grid grid-cols-1 -mr-px grow focus-within:relative">
                  <input
                    id="assign-task-email"
                    name="assign-task-email"
                    type="email"
                    placeholder="jariel@lbta.co"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.currentTarget.value);
                    }}
                    className="col-start-1 row-start-1 block w-full rounded-l-md bg-white py-1.5 pl-4 pr-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600  sm:text-sm/6"
                  />
                </div>
                <button
                  onClick={() => onSendTaskToEmail(email)}
                  type="button"
                  className="flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 focus:relative focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                >
                  <Send
                    aria-hidden="true"
                    className="-ml-0.5 size-4 text-gray-400"
                  />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {
          !id && (
            <a
          href={`/tasks/${task.id}`}
          className="inline-block mt-2 text-sm text-primary hover:underline"
        >
          View Task Details
        </a>
          )
        }
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {task?.assignment?.id ? (
          <ConfirmDeleteTaskDialog
            isConfirmDeleteDialogOpen={isConfirmDeleteDialogOpen}
            setIsConfirmDeleteDialogOpen={setIsConfirmDeleteDialogOpen}
            handleDeleteTask={() => {
              onDeleteTask();
              setIsConfirmDeleteDialogOpen(false);
            }}
          />
        ) : (
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onDeleteTask}
          >
            Delete
          </Button>
        )}
        <CreateEditTaskDialog task={task} />
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
