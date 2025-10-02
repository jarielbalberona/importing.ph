"use client";
import { useProfile } from "@/hooks/react-queries/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function ProfileView({ initialData }: any) {
  const { data: user }: any = useProfile(initialData);

  return (
    <div className="flex justify-center w-full min-h-screen bg-background">
      <div className="w-full max-w-3xl px-4 py-8 mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col items-start gap-8 mb-10 md:flex-row">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 shadow-lg md:w-40 md:h-40 border-background">
              <AvatarImage
                src="/placeholder.svg?height=150&width=150"
                alt="@username"
                width={150}
                height={150}
              />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="absolute flex items-center justify-center w-6 h-6 bg-green-500 border-2 rounded-full -bottom-2 -right-2 border-background">
              <span className="sr-only">Online</span>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  Pro
                </span>
              </div>
            </div>



            {/* Bio Section */}
            <div className="p-4 space-y-2 rounded-lg bg-background">
              <h2 className="flex items-center gap-2 font-bold">
                <span>{user?.name}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-blue-500"
                >
                  <path
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-9.618 5.04L2 8c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-.014z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
