import axiosInstance from "@/api/axios-instance";
import ProfileContent from "@/components/profile/content";
import { cookies } from "next/headers";

export default async function Profile() {
  const cookieStore = await cookies();

  try {
    const { data } = await axiosInstance.get("/auth/me", {
      headers: {
        Cookie: cookieStore.toString()
      }
    });

    return <ProfileContent initialData={data?.data || null} />;
  } catch (error) {
    console.log("error", error);
    // If there's an authentication error, redirect to login
    // redirect("/tasks/auth");
  }
}

