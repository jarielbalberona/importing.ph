"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import AuthFormContent from "@/components/auth/content"
import { useProfile } from "@/hooks/react-queries/auth";
import { useRouter } from "next/navigation";
export default function AuthPage() {
  const [defaultAuthTab, setDefaultAuthTab] = useState('signin')
    const router = useRouter();
  const { data: profile } = useProfile();

  useEffect(() => {
  if (profile && profile?.id) {
    router.push("/tasks")
  }
  }, [profile, router])

  return (
    <div className="flex flex-col flex-1 min-h-full px-6 py-12 mt-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mb-4">
          <Image
            alt="Your Company"
            src="/images/lbta-app.png"
            width={250}
            height={150}
            className="w-auto mx-auto rounded-md"
          />
        </div>
        <Tabs value={defaultAuthTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger onClick={() => setDefaultAuthTab('signin')} value="signin">Sign in</TabsTrigger>
            <TabsTrigger onClick={() => setDefaultAuthTab('signup')} value="signup">Sign up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <AuthFormContent isSignIn={true} />
          </TabsContent>
          <TabsContent value="signup">
            <AuthFormContent setDefaultAuthTab={() => setDefaultAuthTab('signin')} isSignIn={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
