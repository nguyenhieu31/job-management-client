"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Briefcase, ChevronLeft } from "lucide-react"
import { RedirectToGoogle } from "@/services/AuthenticateApi"
import useRouter from "@/hooks/use-router"
import { toast } from "react-toastify"

export default function RegisterPage() {
  const router = useRouter();

  const handleGoogleRegister = async () => {
    try {
      await RedirectToGoogle("register");
    } catch (err: any) {
      toast.error("Failed to redirect to Google registration");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">JobManager</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance">Create your account</h1>
            <p className="text-muted-foreground text-lg">Sign up to get started with job management</p>
          </div>

          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full h-12 bg-transparent text-base"
              type="button"
              onClick={handleGoogleRegister}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-background text-muted-foreground">Customer registration only</span>
            </div>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-sm text-muted-foreground" onClick={() => router.push("/auth/login")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to login
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-muted p-12 items-center justify-center">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-balance">Join as a customer</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create a customer account to submit job requests, track order status, and communicate with our team.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Easy Ordering</h3>
                  <p className="text-sm text-muted-foreground">Submit and track your job requests effortlessly</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified when your order status changes</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
