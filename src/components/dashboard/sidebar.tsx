"use client"

import Link from "next/link"
import Image from "next/image"
import { redirect, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Briefcase, Users, Menu, X, Settings, Lock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { LogoutAction } from "@/store/slice/authentication/Authentication"
import NotificationBell from "@/components/notifications/notification-bell"

const navigation = [
  // { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Công Việc", href: "/dashboard/job", icon: Briefcase },
  { name: "Nhân Viên", href: "/dashboard/employees", icon: Users },
  { name: "Khách Hàng", href: "/dashboard/customers", icon: Users },
  { name: "Yêu Cầu Công Việc", href: "/dashboard/work-requests", icon: Settings },
  { name: "Hoá Đơn", href: "/dashboard/invoices", icon: FileText },
  // { name: "Cấu Hình Thư Mục", href: "/dashboard/settings", icon: Folder },
  { name: "Thay Đổi Mật Khẩu", href: "/dashboard/change-password", icon: Lock },
]

export function Sidebar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {email, fullName, roleName} = useAppSelector((state) => state.authenticate);

  // Filter navigation based on role
  // Default to employee/QA view if roleName is not loaded yet (for security)
  const filteredNavigation = !roleName || roleName === 'EMPLOYEE' || roleName === 'QA' 
    ? navigation.filter(item => item.href === '/dashboard/job' || item.href === '/dashboard/change-password')
    : roleName === 'MANAGER'
    ? navigation.filter(item => item.href !== '/dashboard/settings')
    : navigation;

  const handleClickLogout = async () => {
    const res = await dispatch(LogoutAction());
    if (res.meta.requestStatus === 'fulfilled') {
      redirect('/auth/login');
    }
  }
  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 px-6 border-b gap-3">
            <Image
              src="/logo.png"
              alt="Job Manager Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-xl font-bold">Job Manager</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-3">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName ? fullName : "User Name"}</p>
                  <p className="text-xs text-muted-foreground truncate">{email ? email : "user@example.com"}</p>
                </div>
              </div>
              <NotificationBell />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleClickLogout}
            >
              Đăng Xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
