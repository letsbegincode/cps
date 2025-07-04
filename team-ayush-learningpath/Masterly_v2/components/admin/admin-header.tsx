"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, LogOut, Eye } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminHeader() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search courses, users, content..." className="pl-10 w-80" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Link>
          </Button>

          <ThemeToggle />

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Admin Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
