import { redirect } from "next/navigation"

export default async function AppTasks() {
  redirect("/tasks/")
}
