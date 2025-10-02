"use client"

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateTask, useUpdateTask } from "@/hooks/react-queries/tasks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { appQueryClient } from "@/providers/react-query";

const CreateEditTaskDialog = ({ task }: { task?: any }) => {
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description
      })
    }
  }, [task])

  const handleSubmit = () => {
    if (!taskForm.title || !taskForm.description) return;

    if (task) {
      updateTaskMutation.mutate({ id: task.id, ...taskForm }, {
        onSuccess: () => {
          toast.success("Task updated successfully");
          appQueryClient.invalidateQueries({ queryKey: ["task", task.id] });
      }
      });
    } else {
      createTaskMutation.mutate(taskForm, {
        onSuccess: () => toast("Task created successfully")
      });
    }

    setTaskForm({
      title: "",
      description: "",
    });
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default"
            size="sm"
            className="flex-1">{task ? "Edit Task" : "Create Task"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Edit the task details." : "Create a new task."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              placeholder="Task title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              placeholder="Task description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditTaskDialog;
