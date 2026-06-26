"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Briefcase, UserPlus, Shield, Zap, ArrowLeft } from "lucide-react"
import { GoogleAuthRedirectUrl } from "@/services/AuthenticateApi"

export default function RegisterPage() {
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleRegister = () => {
    setGoogleLoading(true)
    window.location.href = GoogleAuthRedirectUrl()
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">JobManager</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance">Create your account</h1>
            <p className="text-muted-foreground text-lg">Register as a customer using your Google account</p>
          </div>

          {/* Google Register Card */}
          <div className="space-y-6">
            <Card className="p-8 border-2 border-border/80">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/5">
                    <UserPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Customer Account</h3>
                    <p className="text-sm text-muted-foreground">Get started in seconds</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Secure authentication with Google</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">No password to remember</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base bg-transparent border-2 hover:bg-accent"
                  variant="outline"
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleRegister}
                >
                  {googleLoading ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign up with Google
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-background text-muted-foreground">Only Google registration is available</span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-foreground hover:underline transition-colors">
              Sign in
            </Link>
          </p>

          {/* Back to login */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-muted p-12 items-center justify-center">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-balance">Join our platform</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create a customer account to start submitting jobs, track progress, and collaborate with our team.
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Submit Job Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Easily submit and manage your job requests in one place
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your project status with real-time updates
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Direct Communication</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay in touch with our team throughout the process
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &quot;The streamlined registration made it incredibly easy to get started. Within minutes I was submitting my first job request.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full" />
              <div>
                <p className="font-medium text-sm">Alex Chen</p>
                <p className="text-xs text-muted-foreground">Customer at VietVibes Hub</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
