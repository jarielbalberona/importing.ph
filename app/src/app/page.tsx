import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-blue-600">importing.ph</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            Find trusted cargo forwarders from{" "}
            <span className="text-blue-600">China to the Philippines</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Post your shipment once — get multiple quotes, compare, and choose the best.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/sign-up">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Use importing.ph?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>No More Scattered Chats</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Centralized platform for all your shipment needs. No more managing multiple WhatsApp groups or email threads.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Door-to-Door Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get comprehensive quotes including all costs - shipping, customs, delivery - all in one place.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trusted Forwarders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work with verified cargo forwarders rated by the community. Built specifically for PH importers and resellers.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h3 className="font-semibold mb-2">Post Your Shipment</h3>
            <p className="text-gray-600">Origin, destination, volume, and delivery requirements</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h3 className="font-semibold mb-2">Get Quotes</h3>
            <p className="text-gray-600">Receive competitive quotes from multiple forwarders</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h3 className="font-semibold mb-2">Compare & Choose</h3>
            <p className="text-gray-600">Compare prices, delivery times, and service quality</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
            <h3 className="font-semibold mb-2">Track & Manage</h3>
            <p className="text-gray-600">Monitor your shipment and communicate with your forwarder</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Start receiving quotes in minutes
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join hundreds of importers and forwarders already using importing.ph
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/sign-up">
            <Button size="lg" className="px-8">
              Post a Shipment
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="lg" variant="outline" className="px-8">
              Register as Forwarder
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 importing.ph. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
