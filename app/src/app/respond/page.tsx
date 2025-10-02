import { redirect } from "next/navigation"

export default async function TaskRespond() {
  redirect("/tasks/auth")
}
