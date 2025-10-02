"use client";
import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/react-queries/tasks";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import useCsrf from "@/hooks/use-csrf";
import CreateEditTaskDialog from "@/components/tasks/dialogs/create-edit-task";
import TaskCard from "./card";
import { useRouter } from "next/navigation";

const Tasks = ({ initialTasks }: any) => {
  useCsrf();
  const router = useRouter();
  const { data: results }: any = useTasks(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    if ((results?.status === 401 || results?.status === 403) && !results.data) {
      router.push("/tasks/auth");
    }
    }, [results, router]);

  if (!results.data) {
    return <div>No Tasks!</div>;
  }

  const tasks = results.data;

  const unAssignedTasks = tasks.filter(
    (task: any) =>
      task.assigned === false &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sentTasks = tasks.filter(
    (task: any) =>
      task.assigned === true &&
      task.assignment?.status === "pending" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const approvedTasks = tasks.filter(
    (task: any) =>
      task.assigned === true &&
      task.assignment?.status === "approved" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const RejectedTasks = tasks.filter(
    (task: any) =>
      task.assigned === true &&
      task.assignment?.status === "rejected" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Task Management Dashboard</h1>
        <div className="flex flex-row-reverse items-start mt-4 lg:flex-row sm:items-center sm:mt-0 w-[-webkit-fill-available] lg:w-auto">
          <div className="flex items-center ml-4 lg:mx-4 w-[-webkit-fill-available] lg:w-auto">
            <Input
              placeholder="Search tasks..."
              className="max-w-sm "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CreateEditTaskDialog />
        </div>
      </div>
      <Tabs defaultValue="unAssigned" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-4 sm:h-12">
          <TabsTrigger value="unAssigned" className="cursor-pointer">
            Unassigned ({unAssignedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="cursor-pointer">
            Sent ({sentTasks.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="cursor-pointer">
            Approved ({approvedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="cursor-pointer">
            Rejected ({RejectedTasks.length})
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="unAssigned">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unAssignedTasks.length > 0 ? (
                unAssignedTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="py-10 text-center col-span-full text-muted-foreground">
                  No unassigned tasks found. Create a new task to get started.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="sent">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sentTasks.length > 0 ? (
                sentTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="py-10 text-center col-span-full text-muted-foreground">
                  No sent tasks found. Create a new task to get started.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="approved">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedTasks.length > 0 ? (
                approvedTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="py-10 text-center col-span-full text-muted-foreground">
                  No approved tasks found.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="rejected">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {RejectedTasks.length > 0 ? (
                RejectedTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="py-10 text-center col-span-full text-muted-foreground">
                  No approved tasks found.
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
};

export default Tasks;
