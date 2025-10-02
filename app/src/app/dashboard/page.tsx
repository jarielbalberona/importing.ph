import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import RoleSelection from "@/components/auth/role-selection";

export default async function DashboardPage() {
  const { userId, sessionClaims } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user already has a role set
  const userRole = sessionClaims?.publicMetadata?.role as string;

  // If user has a role, redirect to appropriate dashboard
  if (userRole === "importer") {
    redirect("/dashboard/importer");
  } else if (userRole === "forwarder") {
    redirect("/dashboard/forwarder");
  }

  // Show role selection if no role is set
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">importing.ph</h1>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to importing.ph</h1>
          <p className="text-gray-600">Choose your role to get started</p>
        </div>

        <RoleSelection />
      </main>
    </div>
  );
}
