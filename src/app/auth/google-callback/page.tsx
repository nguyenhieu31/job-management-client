"use client"

import { Suspense, useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Briefcase, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { CheckSessionLoginAction } from "@/store/slice/authentication/Authentication"
import useRouter from "@/hooks/use-router"

function CallbackFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">JobManager</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    </div>
  )
}

function GoogleCallbackInner() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const processed = useRef(false)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const isLoginned = useAppSelector((state: any) => state.authenticate.isLoginned)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const error = searchParams.get("error")
    if (error) {
      setErrorMessage(error === "access_denied" ? "Google sign-in was cancelled." : "Authentication failed. Please try again.")
      setStatus("error")
      return
    }

    const checkSession = async () => {
      try {
        const result = await dispatch(CheckSessionLoginAction())
        if (CheckSessionLoginAction.fulfilled.match(result)) {
          setStatus("success")
          setTimeout(() => router.push("/dashboard/job"), 1500)
        } else {
          setErrorMessage("Unable to verify your session. Please try logging in again.")
          setStatus("error")
        }
      } catch {
        setErrorMessage("An unexpected error occurred. Please try again.")
        setStatus("error")
      }
    }

    const timer = setTimeout(checkSession, 500)
    return () => clearTimeout(timer)
  }, [dispatch, router, searchParams])

  useEffect(() => {
    if (isLoginned && status === "loading") {
      setStatus("success")
      setTimeout(() => router.push("/dashboard/job"), 500)
    }
  }, [isLoginned, router, status])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">JobManager</span>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Completing sign in...</h2>
              <p className="text-sm text-muted-foreground">Please wait while we verify your account</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Signed in successfully</h2>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12">
                <Link href="/auth/login">Back to login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 bg-transparent">
                <Link href="/auth/register">Create a new account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <GoogleCallbackInner />
    </Suspense>
  )
}
