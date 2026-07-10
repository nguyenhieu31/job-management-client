"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Briefcase, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAppDispatch } from "@/store/store"
import { LoginAccountAction } from "@/store/slice/authentication/Authentication"
import { LoginResponse } from "@/types/authentication"
import { RedirectToGoogle } from "@/services/AuthenticateApi"
import useRouter from "@/hooks/use-router"
import { toast } from "react-toastify"

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try{
      const payload = await dispatch(LoginAccountAction({ email, password }));
      const response = payload.payload as LoginResponse;
      if(response){
        router.push(response.roleName === "CUSTOMER" ? "/dashboard/order-service" : "/dashboard/job");
      }
    }catch(err:any){
        toast.error(err.message?err.message:"Have error when try login account. Please contact hotline xxx for consulting support.");
    }finally{
        setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await RedirectToGoogle("login");
    } catch (err: any) {
      toast.error("Failed to redirect to Google login");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
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
            <h1 className="text-4xl font-bold tracking-tight text-balance">Welcome back</h1>
            <p className="text-muted-foreground text-lg">Sign in to manage your jobs and team</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base group" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full h-12 text-base bg-transparent hover:bg-accent"
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleLogin}
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
                Sign in with Google
              </>
            )}
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-medium text-foreground hover:underline transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-muted p-12 items-center justify-center">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-balance">Manage your jobs with ease</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Streamline your workflow with our powerful job management platform. Track progress, collaborate with your
              team, and deliver projects on time.
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
                  <h3 className="font-semibold">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay synchronized with your team with instant job status updates
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
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together seamlessly with built-in collaboration tools
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
                  <h3 className="font-semibold">Analytics & Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Track performance metrics and make data-driven decisions
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &quot;This platform has transformed how we manage projects. The interface is intuitive and the features are
              exactly what we needed.&quot;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full" />
              <div>
                <p className="font-medium text-sm">Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">Project Manager at TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
