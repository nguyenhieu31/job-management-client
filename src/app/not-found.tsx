import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft, Briefcase } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center space-y-8">
          {/* Large 404 Display */}
          <div className="relative">
            <h1 className="font-serif text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4">
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance">
                  Page Not Found
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto text-pretty">
                  The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button asChild size="lg" className="min-w-[200px]">
              <Link href="/dashboard" className="gap-2">
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[200px] bg-transparent">
              <Link href="/dashboard/job" className="gap-2">
                <Briefcase className="h-5 w-5" />
                View Jobs
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-12 border-t border-border max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-6">Popular pages you might be looking for:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/dashboard"
                className="group p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">View your overview</p>
                </div>
              </Link>

              <Link
                href="/dashboard/jobs"
                className="group p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Jobs</h3>
                  <p className="text-sm text-muted-foreground">Manage your jobs</p>
                </div>
              </Link>

              <Link
                href="/dashboard/employees"
                className="group p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Employees</h3>
                  <p className="text-sm text-muted-foreground">View your employees</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Decorative Element */}
          <div className="pt-12">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
              <Link href="/dashboard" className="hover:text-foreground transition-colors underline">
                Return to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
